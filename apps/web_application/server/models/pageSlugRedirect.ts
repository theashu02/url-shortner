import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IPageSlugRedirect extends Document {
  oldSlug: string;
  newSlug: string;
  pageId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PageSlugRedirectSchema = new Schema<IPageSlugRedirect>(
  {
    oldSlug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    newSlug: { type: String, required: true, trim: true, lowercase: true },
    pageId: { type: Schema.Types.ObjectId, ref: "Page", required: true, index: true },
  },
  { timestamps: true }
);

if (mongoose.models.PageSlugRedirect) {
  delete mongoose.models.PageSlugRedirect;
}

export const PageSlugRedirectModel: Model<IPageSlugRedirect> =
  mongoose.model<IPageSlugRedirect>("PageSlugRedirect", PageSlugRedirectSchema);
