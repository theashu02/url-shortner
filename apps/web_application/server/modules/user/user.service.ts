import type { IUserRepository, LeanUser } from "./user.repository";
import type { IImageStorage } from "./image-storage";
import { HttpError } from "@/server/core/http-errors";
import { toIsoStringOrNull } from "@/server/lib/date";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  provider: string;
  emailVerified: boolean;
  handle: string | null;
  country: string | null;
  bio: string | null;
  subscription: string | null;
  loginCount: number;
  lastLoginAt: string | null;
  createdAt: string | null;
}

export interface UpdateProfileInput {
  name?: string;
  handle?: string;
  bio?: string;
  image?: string;
}

const HANDLE_PATTERN = /^[a-zA-Z0-9_-]{3,50}$/;

/** SRP: profile mapping + update rules. Persistence via IUserRepository (DIP). */
export class UserService {
  constructor(
    private readonly users: IUserRepository,
    private readonly images: IImageStorage,
  ) {}

  toProfile(user: LeanUser): UserProfile {
    return {
      id: user._id.toString(),
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image ?? null,
      provider: user.provider,
      emailVerified: user.emailVerified ?? false,
      handle: user.handle ?? null,
      country: user.country ?? null,
      bio: user.bio ?? null,
      subscription: user.subscription ?? null,
      loginCount: user.loginCount ?? 0,
      lastLoginAt: toIsoStringOrNull(user.lastLoginAt),
      createdAt: toIsoStringOrNull(user.createdAt),
    };
  }

  async getProfileOrThrow(userId: string): Promise<UserProfile> {
    const user = await this.users.findById(userId);
    if (!user) throw new HttpError(404, "User not found.");
    return this.toProfile(user);
  }

  async updateProfileOrThrow(userId: string, body: UpdateProfileInput): Promise<UserProfile> {
    const setFields: Record<string, unknown> = {};
    const unsetFields: Record<string, 1> = {};

    if (body.name !== undefined) {
      const name = body.name.trim().slice(0, 50);
      if (!name) throw new HttpError(400, "Name cannot be empty.");
      setFields["name"] = name;
    }

    if (body.handle !== undefined) {
      const handle = body.handle.trim();
      if (handle === "") {
        unsetFields["handle"] = 1;
      } else {
        if (!HANDLE_PATTERN.test(handle)) {
          throw new HttpError(400, "Nickname must be 3-50 characters (letters, numbers, _ or -).");
        }
        setFields["handle"] = handle;
      }
    }

    if (body.bio !== undefined) {
      const bio = body.bio.trim().slice(0, 500);
      if (bio === "") {
        unsetFields["bio"] = 1;
      } else {
        setFields["bio"] = bio;
      }
    }

    if (body.image !== undefined) {
      const image = body.image.trim();
      if (image === "") {
        unsetFields["image"] = 1;
      } else {
        try {
          new URL(image);
        } catch {
          throw new HttpError(400, "Photo must be a valid URL.");
        }
        setFields["image"] = image.slice(0, 2048);
      }
    }

    const update: Record<string, unknown> = {};
    if (Object.keys(setFields).length > 0) update.$set = setFields;
    if (Object.keys(unsetFields).length > 0) update.$unset = unsetFields;
    if (Object.keys(update).length === 0) throw new HttpError(400, "Nothing to update.");

    try {
      const user = await this.users.updateById(userId, update);
      if (!user) throw new HttpError(404, "User not found.");
      return this.toProfile(user);
    } catch (err) {
      if (err instanceof HttpError) throw err;
      if (err !== null && typeof err === "object" && "code" in err) {
        const record = err as { code?: unknown };
        if (record.code === 11000) throw new HttpError(409, "This nickname is already taken.");
      }
      throw err;
    }
  }

  async updateImageOrThrow(userId: string, file: File | undefined): Promise<UserProfile> {
    if (!file) throw new HttpError(400, "No image file provided.");
    if (file.size > 5 * 1024 * 1024) throw new HttpError(400, "Image must be less than 5MB.");

    const existing = await this.users.findImageById(userId);
    const oldImageUrl = existing?.image;
    const newImageUrl = await this.images.upload(file);
    const user = await this.users.updateById(userId, { $set: { image: newImageUrl } });
    if (oldImageUrl) await this.images.deleteByUrl(oldImageUrl);
    if (!user) throw new HttpError(404, "User not found.");
    return this.toProfile(user);
  }

  async deleteImageOrThrow(userId: string): Promise<UserProfile> {
    const existing = await this.users.findImageById(userId);
    const oldImageUrl = existing?.image;
    const user = await this.users.unsetImage(userId);
    if (oldImageUrl) await this.images.deleteByUrl(oldImageUrl);
    if (!user) throw new HttpError(404, "User not found.");
    return this.toProfile(user);
  }
}
