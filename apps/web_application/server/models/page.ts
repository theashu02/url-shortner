import mongoose, { Schema, type Document, type Model } from "mongoose";
import {
  PAGE_BLOCK_TYPES,
  PAGE_BUTTON_SHAPES,
  PAGE_SLUG_RE,
  PAGE_STATUSES,
} from "@/server/lib/pages";
import type {
  PageBlockType,
  PageStatus,
  PageTheme,
} from "@/server/lib/pages";

export interface IPageBlock {
  key: string;
  type: PageBlockType;
  position: number;
  visible: boolean;
  pinned: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  props: Record<string, unknown>;
}

export interface IPage extends Document {
  userId: string;
  slug: string;
  title: string;
  templateId: string;
  goal?: string;
  theme: PageTheme;
  blocks: IPageBlock[];
  status: PageStatus;
  publishedVersionId?: mongoose.Types.ObjectId;
  linkedShortCode?: string;
  views: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export const PageThemeSchema = new Schema<PageTheme>(
  {
    header: { type: String, required: true },
    card: { type: String, required: true },
    accent: { type: String, required: true },
    dark: { type: Boolean, default: false },
    description: { type: String, required: false, maxlength: 200 },
    avatarUrl: { type: String, required: false, maxlength: 500 },
    buttonShape: { type: String, required: false, enum: PAGE_BUTTON_SHAPES },
  },
  { _id: false }
);

export const PageBlockSchema = new Schema<IPageBlock>(
  {
    key: { type: String, required: true },
    type: { type: String, required: true, enum: PAGE_BLOCK_TYPES },
    position: { type: Number, required: true, min: 0 },
    visible: { type: Boolean, default: true },
    pinned: { type: Boolean, default: false },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    props: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const PageSchema = new Schema<IPage>(
  {
    userId: { type: String, required: true, index: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 50,
      match: PAGE_SLUG_RE,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    templateId: { type: String, required: true },
    goal: { type: String, required: false, maxlength: 40 },
    theme: { type: PageThemeSchema, required: true },
    blocks: { type: [PageBlockSchema], default: [] },
    status: {
      type: String,
      required: true,
      enum: PAGE_STATUSES,
      default: "draft",
    },
    publishedVersionId: {
      type: Schema.Types.ObjectId,
      ref: "PageVersion",
      required: false,
    },
    linkedShortCode: { type: String, required: false },
    views: { type: Number, default: 0, min: 0 },
    clicks: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

PageSchema.index({ userId: 1, updatedAt: -1 });
PageSchema.index({ linkedShortCode: 1 }, { sparse: true });

if (mongoose.models.Page) {
  delete mongoose.models.Page;
}

export const PageModel: Model<IPage> = mongoose.model<IPage>(
  "Page",
  PageSchema
);
