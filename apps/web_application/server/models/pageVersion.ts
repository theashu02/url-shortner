import mongoose, { Schema, type Document, type Model } from "mongoose";
import { PageBlockSchema, PageThemeSchema, type IPageBlock } from "./page";
import type { PageTheme } from "@/server/lib/pages";

export interface IPageVersionSnapshot {
  title: string;
  theme: PageTheme;
  blocks: IPageBlock[];
}

export interface IPageVersion extends Document {
  pageId: mongoose.Types.ObjectId;
  version: number;
  snapshot: IPageVersionSnapshot;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PageVersionSnapshotSchema = new Schema<IPageVersionSnapshot>(
  {
    title: { type: String, required: true },
    theme: { type: PageThemeSchema, required: true },
    blocks: { type: [PageBlockSchema], default: [] },
  },
  { _id: false }
);

const PageVersionSchema = new Schema<IPageVersion>(
  {
    pageId: {
      type: Schema.Types.ObjectId,
      ref: "Page",
      required: true,
      index: true,
    },
    version: { type: Number, required: true, min: 1 },
    snapshot: { type: PageVersionSnapshotSchema, required: true },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

PageVersionSchema.index({ pageId: 1, version: -1 }, { unique: true });

if (mongoose.models.PageVersion) {
  delete mongoose.models.PageVersion;
}

export const PageVersionModel: Model<IPageVersion> =
  mongoose.model<IPageVersion>("PageVersion", PageVersionSchema);
