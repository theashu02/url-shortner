import { MailConnectionModel } from "@/server/models/mailConnection";
import type { MailProvider } from "@/server/models/mailConnection";
import type { OAuthProvider } from "./mail.types";
import type { IDatabase } from "@/server/core/database";

export type LeanMailConnection = {
  _id: { toString(): string };
  provider: string;
  email: string;
  status: string;
  connectedAt?: Date;
  lastVerifiedAt?: Date;
  smtp?: {
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    fromName?: string;
    fromEmail?: string;
  };
};

/**
 * SRP: mailbox-connection persistence.
 * Provider fields use the MailProvider/OAuthProvider unions (narrowed at the
 * service/controller boundary) so Mongoose strict filters typecheck without
 * loose casts.
 */
export interface IMailRepository {
  listForUser(userId: string): Promise<LeanMailConnection[]>;
  upsertOAuth(input: {
    userId: string;
    provider: OAuthProvider;
    email: string;
    accessTokenEnc: string;
    refreshTokenEnc?: string;
    expiresAt: Date;
    scopes: string[];
  }): Promise<void>;
  upsertSmtp(input: {
    userId: string;
    email: string;
    smtp: Record<string, unknown>;
  }): Promise<LeanMailConnection>;
  findForUser(userId: string, provider: MailProvider, email: string): Promise<{ deleteOne(): Promise<unknown>; provider: string; oauth?: { accessTokenEnc?: string } | null } | null>;
}

export class MongoMailRepository implements IMailRepository {
  constructor(private readonly db: IDatabase) {}

  async listForUser(userId: string): Promise<LeanMailConnection[]> {
    await this.db.connect();
    const list = await MailConnectionModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return list as unknown as LeanMailConnection[];
  }

  async upsertOAuth(input: {
    userId: string;
    provider: OAuthProvider;
    email: string;
    accessTokenEnc: string;
    refreshTokenEnc?: string;
    expiresAt: Date;
    scopes: string[];
  }): Promise<void> {
    await this.db.connect();
    await MailConnectionModel.findOneAndUpdate(
      { userId: input.userId, provider: input.provider, email: input.email },
      {
        $set: {
          status: "connected",
          oauth: {
            accessTokenEnc: input.accessTokenEnc,
            refreshTokenEnc: input.refreshTokenEnc,
            expiresAt: input.expiresAt,
            scopes: input.scopes,
          },
          lastError: undefined,
          connectedAt: new Date(),
          lastVerifiedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    );
  }

  async upsertSmtp(input: { userId: string; email: string; smtp: Record<string, unknown> }): Promise<LeanMailConnection> {
    await this.db.connect();
    const saved = await MailConnectionModel.findOneAndUpdate(
      { userId: input.userId, provider: "smtp", email: input.email },
      {
        $set: {
          status: "connected",
          smtp: input.smtp,
          lastError: undefined,
          connectedAt: new Date(),
          lastVerifiedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    ).lean();
    return saved as unknown as LeanMailConnection;
  }

  async findForUser(userId: string, provider: MailProvider, email: string) {
    await this.db.connect();
    return MailConnectionModel.findOne({ userId, provider, email }) as unknown as Promise<{
      deleteOne(): Promise<unknown>;
      provider: string;
      oauth?: { accessTokenEnc?: string } | null;
    } | null>;
  }
}


