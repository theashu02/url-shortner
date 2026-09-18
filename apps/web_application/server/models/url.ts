import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUrl extends Document {
  shortCode: string;
  url: string;
  userId?: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const UrlSchema = new Schema<IUrl>(
  {
    shortCode: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    userId: { type: String, required: false },
    clicks: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Optional: create compound index if you want to search by userId easily
UrlSchema.index({ userId: 1, createdAt: -1 });

export const UrlModel: Model<IUrl> = mongoose.models.Url || mongoose.model<IUrl>("Url", UrlSchema);
