import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

export const MAIL_PROVIDERS = ["gmail", "outlook", "smtp"] as const;
export type MailProvider = (typeof MAIL_PROVIDERS)[number];

const oauthSchema = new Schema(
  {
    accessTokenEnc: { type: String },
    refreshTokenEnc: { type: String },
    expiresAt: { type: Date },
    scopes: { type: [String], default: [] },
  },
  { _id: false }
);

const smtpSchema = new Schema(
  {
    host: { type: String },
    port: { type: Number },
    secure: { type: Boolean, default: true },
    username: { type: String },
    passwordEnc: { type: String, select: false },
    fromName: { type: String },
    fromEmail: { type: String },
  },
  { _id: false }
);

const mailConnectionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, enum: MAIL_PROVIDERS, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    status: { type: String, enum: ["connected", "error"], default: "connected" },
    oauth: { type: oauthSchema },
    smtp: { type: smtpSchema },
    lastError: { type: String },
    connectedAt: { type: Date, default: Date.now },
    lastVerifiedAt: { type: Date },
  },
  { timestamps: true }
);

mailConnectionSchema.index({ userId: 1, provider: 1, email: 1 }, { unique: true });

export type MailConnection = InferSchemaType<typeof mailConnectionSchema>;
export type MailConnectionModel = Model<MailConnection>;

export const MailConnectionModel: MailConnectionModel =
  (models.MailConnection as MailConnectionModel) ||
  model<MailConnection>("MailConnection", mailConnectionSchema);
