import mongoose from "mongoose";
import { connectToDatabase } from "@/server/db/mongoose";
import { ClickEventModel } from "@/server/models/clickEvent";
import { UrlModel } from "@/server/models/url";
import { buildClickEventDoc } from "@/server/lib/click-capture";
import type { EnrichedClickEvent } from "@/server/lib/click-capture";
import type { IDatabase } from "@/server/core/database";

/**
 * SRP: click-event persistence for the device-interstitial flow.
 */
export interface IDeviceClickRepository {
  createInterstitialClick(shortCode: string, destinationUrl: string, doc: Record<string, unknown>): Promise<string>;
  updateDetails(eventId: string, shortCode: string, patch: Record<string, number | string | boolean | null>): Promise<boolean>;
  markContinued(eventId: string, shortCode: string): Promise<boolean>;
  updateGeo(eventId: string, shortCode: string, geo: Record<string, unknown>): Promise<void>;
  incrementUrlClicks(shortCode: string): Promise<void>;
}

export class MongoDeviceClickRepository implements IDeviceClickRepository {
  constructor(private readonly db: IDatabase) {}

  async createInterstitialClick(
    shortCode: string,
    destinationUrl: string,
    doc: Record<string, unknown>,
  ): Promise<string> {
    await this.db.connect();
    const created = await Promise.all([
      ClickEventModel.create({ ...doc, shortCode, destinationUrl, continued: false }),
      UrlModel.updateOne({ shortCode }, { $inc: { clicks: 1 } }),
    ]);
    return String((created[0] as { _id: unknown })._id);
  }

  private toObjectId(id: string): mongoose.Types.ObjectId | null {
    try {
      return new mongoose.Types.ObjectId(id);
    } catch {
      return null;
    }
  }

  async updateDetails(
    eventId: string,
    shortCode: string,
    patch: Record<string, number | string | boolean | null>,
  ): Promise<boolean> {
    const _id = this.toObjectId(eventId);
    if (!_id) return false;
    await this.db.connect();
    const res = await ClickEventModel.updateOne(
      { _id, shortCode },
      { $set: { ...patch, capturedAt: new Date() } },
    );
    return res.matchedCount > 0;
  }

  async updateGeo(eventId: string, shortCode: string, geo: Record<string, unknown>): Promise<void> {
    const _id = this.toObjectId(eventId);
    if (!_id) return;
    await this.db.connect();
    await ClickEventModel.updateOne({ _id, shortCode }, { $set: { ...geo } });
  }

  async markContinued(eventId: string, shortCode: string): Promise<boolean> {
    const _id = this.toObjectId(eventId);
    if (!_id) return false;
    await this.db.connect();
    const res = await ClickEventModel.updateOne(
      { _id, shortCode },
      { $set: { continued: true, continuedAt: new Date() } },
    );
    return res.matchedCount > 0;
  }

  async incrementUrlClicks(shortCode: string): Promise<void> {
    await this.db.connect();
    await UrlModel.updateOne({ shortCode }, { $inc: { clicks: 1 } });
  }
}

export { buildClickEventDoc };
export type { EnrichedClickEvent };
void connectToDatabase;


