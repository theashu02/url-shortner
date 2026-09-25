import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUrl extends Document {
  shortCode: string;
  url: string;
  userId?: string;
  clicks: number;
  expiresAt?: Date;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UrlSchema = new Schema<IUrl>(
  {
    shortCode: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    userId: { type: String, required: false },
    clicks: { type: Number, default: 0 },
    expiresAt: { type: Date, required: false },
    utm: {
      source: { type: String, required: false },
      medium: { type: String, required: false },
      campaign: { type: String, required: false },
      term: { type: String, required: false },
      content: { type: String, required: false },
    },
  },
  {
    timestamps: true,
  }
);

// Optional: create compound index if you want to search by userId easily
UrlSchema.index({ userId: 1, createdAt: -1 });

if (mongoose.models.Url) {
  delete mongoose.models.Url;
}

export const UrlModel: Model<IUrl> = mongoose.model<IUrl>("Url", UrlSchema);
