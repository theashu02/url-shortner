import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IPageView extends Document {
  pageId: mongoose.Types.ObjectId;
  slug: string;
  visitorHash?: string | null;
  referrer?: string | null;
  deviceType: string;
  country?: string | null;
  clickedBlockKey?: string | null;
  viewedAt: Date;
}

const PageViewSchema = new Schema<IPageView>(
  {
    pageId: {
      type: Schema.Types.ObjectId,
      ref: "Page",
      required: true,
      index: true,
    },
    slug: { type: String, required: true, index: true },
    visitorHash: { type: String, default: null },
    referrer: { type: String, default: null },
    deviceType: { type: String, default: "desktop" },
    country: { type: String, default: null },
    clickedBlockKey: { type: String, default: null },
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

PageViewSchema.index({ pageId: 1, viewedAt: -1 });
PageViewSchema.index({ slug: 1, viewedAt: -1 });
PageViewSchema.index({ pageId: 1, clickedBlockKey: 1, viewedAt: -1 });

if (mongoose.models.PageView) {
  delete mongoose.models.PageView;
}

export const PageViewModel: Model<IPageView> = mongoose.model<IPageView>(
  "PageView",
  PageViewSchema
);
