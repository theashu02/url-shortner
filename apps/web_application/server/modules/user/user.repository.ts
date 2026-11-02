import { UserModel, type AppUser } from "@/server/models/user";
import type { IDatabase } from "@/server/core/database";

export type LeanUser = AppUser & { _id: { toString(): string } };

export interface IUserRepository {
  findById(id: string): Promise<LeanUser | null>;
  findImageById(id: string): Promise<{ image?: string | null } | null>;
  updateById(id: string, update: Record<string, unknown>): Promise<LeanUser | null>;
  unsetImage(id: string): Promise<LeanUser | null>;
}

function isCastError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  if (!("name" in err)) return false;
  const record = err as { name?: unknown };
  return record.name === "CastError";
}

export class MongoUserRepository implements IUserRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<LeanUser | null> {
    await this.db.connect();
    try {
      const user = await UserModel.findById(id).lean();
      return user as unknown as LeanUser | null;
    } catch (err) {
      if (isCastError(err)) return null;
      throw err;
    }
  }

  async findImageById(id: string): Promise<{ image?: string | null } | null> {
    await this.db.connect();
    try {
      const user = await UserModel.findById(id).select("image").lean();
      return user as unknown as { image?: string | null } | null;
    } catch (err) {
      if (isCastError(err)) return null;
      throw err;
    }
  }

  async updateById(id: string, update: Record<string, unknown>): Promise<LeanUser | null> {
    await this.db.connect();
    try {
      const user = await UserModel.findByIdAndUpdate(id, update, {
        returnDocument: "after",
        runValidators: true,
      }).lean();
      return user as unknown as LeanUser | null;
    } catch (err) {
      if (isCastError(err)) return null;
      throw err;
    }
  }

  async unsetImage(id: string): Promise<LeanUser | null> {
    return this.updateById(id, { $unset: { image: 1 } });
  }
}
