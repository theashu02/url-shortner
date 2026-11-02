import { isValidObjectId, type Types } from "mongoose";
import { validatePageBlocks, validatePageTheme, isBlockLiveNow } from "@/server/lib/pages";
import type { IPage } from "@/server/models/page";
import type { IPageVersionSnapshot } from "@/server/models/pageVersion";
import type { IPageVersionRepository, IPageRepository } from "./page.repositories";
import { toPageDTO, toVersionDTO } from "./page.mapper";
import type { PageDTO, PageVersionDTO, ServiceError } from "./page.types";

/**
 * SRP: publish lifecycle + version history reads.
 */
export class PagePublishService {
  constructor(
    private readonly pages: IPageRepository,
    private readonly versions: IPageVersionRepository,
  ) {}

  private frozenSnapshotOf(page: IPage): IPageVersionSnapshot {
    return JSON.parse(JSON.stringify({ title: page.title, theme: page.theme, blocks: page.blocks ?? [] }));
  }

  private validateDraftForPublish(page: IPage): string | null {
    if (!page.title || page.title.trim().length === 0) return "Add a page title before publishing.";
    const themeErrors = validatePageTheme(page.theme);
    if (themeErrors.length > 0) return themeErrors[0] as string;
    const blockErrors = validatePageBlocks(page.blocks ?? []);
    if (blockErrors.length > 0) return blockErrors[0] as string;
    return null;
  }

  async publishForUser(userId: string, id: string): Promise<{ page: PageDTO; version: PageVersionDTO } | ServiceError> {
    if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
    const page = await this.pages.findByIdForUser(id, userId);
    if (!page) return { status: 404, message: "Page not found." };

    const invalid = this.validateDraftForPublish(page);
    if (invalid) return { status: 400, message: invalid };

    const snapshot = this.frozenSnapshotOf(page);
    let versionDoc = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const next = (await this.versions.latestNumber(String(page._id))) + 1;
      try {
        versionDoc = await this.versions.create({ pageId: String(page._id), version: next, snapshot, createdBy: userId });
        break;
      } catch (err) {
        const code = (err as { code?: number })?.code;
        if (code === 11000 && attempt < 2) continue;
        throw err;
      }
    }
    if (!versionDoc) return { status: 409, message: "Publish conflict. Please try again." };

    page.status = "published";
    page.publishedVersionId = versionDoc._id as Types.ObjectId;
    await this.pages.save(page);
    return { page: toPageDTO(page), version: toVersionDTO(versionDoc) };
  }

  async unpublishForUser(userId: string, id: string): Promise<PageDTO | ServiceError> {
    if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
    const page = await this.pages.findByIdForUser(id, userId);
    if (!page) return { status: 404, message: "Page not found." };
    page.status = "draft";
    page.publishedVersionId = undefined;
    await this.pages.save(page);
    return toPageDTO(page);
  }

  async listVersionsForUser(userId: string, id: string): Promise<{ versions: PageVersionDTO[] } | ServiceError> {
    if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
    if (!(await this.pages.owned(id, userId))) return { status: 404, message: "Page not found." };
    const docs = await this.versions.list(id);
    return { versions: docs.map(toVersionDTO) };
  }

  async getVersionForUser(userId: string, id: string, version: number): Promise<{ version: PageVersionDTO } | ServiceError> {
    if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
    if (!Number.isInteger(version) || version < 1) return { status: 404, message: "Version not found." };
    if (!(await this.pages.owned(id, userId))) return { status: 404, message: "Page not found." };
    const doc = await this.versions.find(id, version);
    if (!doc) return { status: 404, message: "Version not found." };
    return { version: toVersionDTO(doc) };
  }

  liveNow(block: { visible?: unknown; startsAt?: unknown; endsAt?: unknown }): boolean {
    return isBlockLiveNow(block);
  }
}


