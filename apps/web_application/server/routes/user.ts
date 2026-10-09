import { Elysia, t } from "elysia";
import { getAuthUserId } from "@/server/lib/auth";
import { connectToDatabase } from "@/server/db/mongoose";
import { UserModel, type AppUser } from "@/server/models/user";

type LeanUser = AppUser & { _id: { toString(): string } };

function toProfile(user: LeanUser) {
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
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt?.toISOString() ?? null,
  };
}

const HANDLE_PATTERN = /^[a-zA-Z0-9_-]{3,50}$/;

export const userRoute = new Elysia()
  .get("/user/me", async ({ request, set }) => {
    try {
      const userId = await getAuthUserId(request);
      if (!userId) {
        set.status = 401;
        return { message: "Unauthorized. Please log in." };
      }

      await connectToDatabase();
      const user = await UserModel.findById(userId).lean();

      if (!user) {
        set.status = 404;
        return { message: "User not found." };
      }

      return toProfile(user as LeanUser);
    } catch (err) {
      console.error("[user] me:", err);
      set.status = 500;
      return { message: "Internal server error" };
    }
  })

  .patch(
    "/user/update",
    async ({ body, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }

        const $set: Record<string, unknown> = {};
        const $unset: Record<string, 1> = {};

        if (body.name !== undefined) {
          const name = body.name.trim().slice(0, 50);
          if (!name) {
            set.status = 400;
            return { message: "Name cannot be empty." };
          }
          $set.name = name;
        }

        if (body.handle !== undefined) {
          const handle = body.handle.trim();
          if (handle === "") {
            $unset.handle = 1;
          } else {
            if (!HANDLE_PATTERN.test(handle)) {
              set.status = 400;
              return { message: "Nickname must be 3-50 characters (letters, numbers, _ or -)." };
            }
            $set.handle = handle;
          }
        }

        if (body.bio !== undefined) {
          const bio = body.bio.trim().slice(0, 500);
          if (bio === "") {
            $unset.bio = 1;
          } else {
            $set.bio = bio;
          }
        }

        if (body.image !== undefined) {
          const image = body.image.trim();
          if (image === "") {
            $unset.image = 1;
          } else {
            try {
              new URL(image);
            } catch {
              set.status = 400;
              return { message: "Photo must be a valid URL." };
            }
            $set.image = image.slice(0, 2048);
          }
        }

        const update: Record<string, unknown> = {};
        if (Object.keys($set).length > 0) update.$set = $set;
        if (Object.keys($unset).length > 0) update.$unset = $unset;

        if (Object.keys(update).length === 0) {
          set.status = 400;
          return { message: "Nothing to update." };
        }

        await connectToDatabase();
        const user = await UserModel.findByIdAndUpdate(userId, update, {
          new: true,
          runValidators: true,
        }).lean();

        if (!user) {
          set.status = 404;
          return { message: "User not found." };
        }

        return toProfile(user as LeanUser);
      } catch (err) {
        if (err && typeof err === "object" && "code" in err && err.code === 11000) {
          set.status = 409;
          return { message: "This nickname is already taken." };
        }
        console.error("[user] update:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        handle: t.Optional(t.String()),
        bio: t.Optional(t.String()),
        image: t.Optional(t.String()),
      }),
    }
  );
