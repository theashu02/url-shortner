import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClickEvent extends Document {
  shortCode: string;

  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  deviceType: string;
  deviceVendor?: string;
  deviceModel?: string;
  isBot: boolean;
  botReason?: string | null;
  inAppBrowser?: string | null;

  language?: string | null;
  languageList: string[];

  referrer?: string | null;
  referrerDomain?: string | null;
  referrerType: string;

  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;

  ipHash?: string | null;
  visitorHash?: string | null;
  protocol: string;

  geoCountry?: string | null;
  geoRegion?: string | null;
  geoCity?: string | null;
  geoLatitude?: number | null;
  geoLongitude?: number | null;
  geoTimezone?: string | null;
  geoIsp?: string | null;
  geoOrg?: string | null;
  geoAsNumber?: string | null;

  clickedAt: Date;
}

const ClickEventSchema = new Schema<IClickEvent>(
  {
    shortCode: { type: String, required: true, index: true },

    browser: String,
    browserVersion: String,
    os: String,
    osVersion: String,
    deviceType: { type: String, default: "desktop" },
    deviceVendor: String,
    deviceModel: String,
    isBot: { type: Boolean, default: false },
    botReason: { type: String, default: null },
    inAppBrowser: { type: String, default: null },

    language: { type: String, default: null },
    languageList: { type: [String], default: [] },

    referrer: { type: String, default: null },
    referrerDomain: { type: String, default: null },
    referrerType: { type: String, default: "direct" },

    utmSource: { type: String, default: null },
    utmMedium: { type: String, default: null },
    utmCampaign: { type: String, default: null },
    utmTerm: { type: String, default: null },
    utmContent: { type: String, default: null },

    ipHash: { type: String, default: null },
    visitorHash: { type: String, default: null },
    protocol: { type: String, default: "https" },

    geoCountry: { type: String, default: null },
    geoRegion: { type: String, default: null },
    geoCity: { type: String, default: null },
    geoLatitude: { type: Number, default: null },
    geoLongitude: { type: Number, default: null },
    geoTimezone: { type: String, default: null },
    geoIsp: { type: String, default: null },
    geoOrg: { type: String, default: null },
    geoAsNumber: { type: String, default: null },

    clickedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

ClickEventSchema.index({ shortCode: 1, clickedAt: -1 });
ClickEventSchema.index({ shortCode: 1, visitorHash: 1 });
ClickEventSchema.index({ shortCode: 1, geoCountry: 1 });
ClickEventSchema.index({ shortCode: 1, deviceType: 1 });
ClickEventSchema.index({ shortCode: 1, isBot: 1 });

if (mongoose.models.ClickEvent) {
  delete mongoose.models.ClickEvent;
}

export const ClickEventModel: Model<IClickEvent> = mongoose.model<IClickEvent>(
  "ClickEvent",
  ClickEventSchema,
);
