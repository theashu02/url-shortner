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

  destinationUrl?: string | null;
  continued: boolean;
  continuedAt?: Date | null;
  capturedAt?: Date | null;

  screenWidth?: number | null;
  screenHeight?: number | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  touchSupport?: boolean | null;
  cpuCores?: number | null;
  deviceMemory?: number | null;
  platform?: string | null;
  clientTimezone?: string | null;
  clientUa?: string | null;
  connectionType?: string | null;
  connectionDownlink?: number | null;
  connectionRtt?: number | null;
  connectionSaveData?: boolean | null;
  uaPlatform?: string | null;
  uaPlatformVersion?: string | null;
  uaArchitecture?: string | null;
  uaBitness?: string | null;
  uaModel?: string | null;
  uaMobile?: boolean | null;

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

    destinationUrl: { type: String, default: null },
    continued: { type: Boolean, default: false },
    continuedAt: { type: Date, default: null },
    capturedAt: { type: Date, default: null },

    screenWidth: { type: Number, default: null },
    screenHeight: { type: Number, default: null },
    viewportWidth: { type: Number, default: null },
    viewportHeight: { type: Number, default: null },
    touchSupport: { type: Boolean, default: null },
    cpuCores: { type: Number, default: null },
    deviceMemory: { type: Number, default: null },
    platform: { type: String, default: null },
    clientTimezone: { type: String, default: null },
    clientUa: { type: String, default: null },
    connectionType: { type: String, default: null },
    connectionDownlink: { type: Number, default: null },
    connectionRtt: { type: Number, default: null },
    connectionSaveData: { type: Boolean, default: null },
    uaPlatform: { type: String, default: null },
    uaPlatformVersion: { type: String, default: null },
    uaArchitecture: { type: String, default: null },
    uaBitness: { type: String, default: null },
    uaModel: { type: String, default: null },
    uaMobile: { type: Boolean, default: null },

    clickedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

ClickEventSchema.index({ shortCode: 1, clickedAt: -1 });
ClickEventSchema.index({ shortCode: 1, visitorHash: 1 });
ClickEventSchema.index({ shortCode: 1, geoCountry: 1 });
ClickEventSchema.index({ shortCode: 1, deviceType: 1 });
ClickEventSchema.index({ shortCode: 1, isBot: 1 });
ClickEventSchema.index({ shortCode: 1, continued: 1 });

if (mongoose.models.ClickEvent) {
  delete mongoose.models.ClickEvent;
}

export const ClickEventModel: Model<IClickEvent> = mongoose.model<IClickEvent>(
  "ClickEvent",
  ClickEventSchema,
);
