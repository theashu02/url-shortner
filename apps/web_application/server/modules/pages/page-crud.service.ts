import { isValidObjectId } from "mongoose";
import { getPageTemplateSeed, buildSeedBlocks } from "@/server/lib/pageTemplates";
import {
  MAX_BLOCK_ITEMS,
  MAX_PAGE_BLOCKS,
  PAGE_ITEM_SHORT_CODE_RE,
  applyInitialPageUrl,
  normalizePageSlug,
  validatePageBlocks,
  validatePageGoal,
  validatePageSlug,
} from "@/server/lib/pages";
import { CUSTOM_SLUG_RE, escapeRegex } from "@/server/lib/url";
import type { IPage } from "@/server/models/page";
import { UrlModel } from "@/server/models/url";
import type { IDatabase } from "@/server/core/database";
import type { IPageRepository, IPageRedirectRepository } from "./page.repositories";
import { toPageDTO } from "./page.mapper";
import type { PageDTO, PagePaginationMeta, ServiceError } from "./page.types";

/**
 * SRP: page CRUD + templates + slug availability. Persistence via repositories (DIP).
 */
export class PageCrudService {
  constructor(
    private readonly pages: IPageRepository,
    private readonly redirects: IPageRedirectRepository,
    private readonly db: IDatabase,
  ) {}

  private async suggestUniqueSlug(base: string): Promise<string> {
    const root = normalizePageSlug(base).slice(0, 40) || "page";
    for (let i = 0; i < 10; i++) {
      const candidate = i === 0 ? root : `${root}-${i + 1}`;
      if (!(await this.pages.existsBySlug(candidate))) return candidate;
    }
    const { generateShortCode } = await import("@/server/lib/base62");
    for (let i = 0; i < 10; i++) {
      const candidate = `${root}-${generateShortCode(4).toLowerCase()}`;
      if (!(await this.pages.existsBySlug(candidate))) return candidate;
    }
    return `${root}-${Date.now().toString(36)}`;
  }

  async checkSlugAvailability(rawSlug: string): Promise<{ slug: string; available: boolean; message?: string }> {
    const slug = normalizePageSlug(rawSlug);
    const error = validatePageSlug(slug);
    if (error) return { slug, available: false, message: error };
    if (await this.pages.existsBySlug(slug)) {
      return { slug, available: false, message: "This URL is already taken. Please choose another." };
    }
    return { slug, available: true };
  }

  async createFromTemplate(
    userId: string,
    input: { templateId: string; title?: string; slug?: string; goal?: string; initialUrl?: string },
  ): Promise<PageDTO | ServiceError> {
    const seed = getPageTemplateSeed(input.templateId);
    if (!seed) return { status: 404, message: "Template not found." };

    const goalError = validatePageGoal(input.goal);
    if (goalError) return { status: 400, message: goalError };
    const goal = typeof input.goal === "string" && input.goal.length > 0 ? input.goal : undefined;
    const title = input.title && input.title.trim().length > 0 ? input.title.trim().slice(0, 120) : seed.name;

    let slug: string;
    if (input.slug && input.slug.trim().length > 0) {
      slug = normalizePageSlug(input.slug);
      const error = validatePageSlug(slug);
      if (error) return { status: 400, message: error };
      if (await this.pages.existsBySlug(slug)) {
        return { status: 409, message: "This URL is already taken. Please choose another." };
      }
    } else {
      slug = await this.suggestUniqueSlug(title);
    }

    const blocks = applyInitialPageUrl(
      buildSeedBlocks(seed.id).map((block) => ({ ...block, props: { ...(block.props ?? {}) } })),
      input.initialUrl,
    );
    const blockErrors = validatePageBlocks(blocks);
    if (blockErrors.length > 0) return { status: 400, message: blockErrors[0] ?? "Invalid page blocks." };

    const page = await this.pages.create({
      userId,
      slug,
      title,
      templateId: seed.id,
      goal,
      theme: { ...seed.theme },
      blocks,
      status: "draft",
      views: 0,
    });
    return toPageDTO(page);
  }

  async listForUser(
    userId: string,
    query: { page?: string; limit?: string; search?: string; sortBy?: string; order?: string },
  ): Promise<{ pages: PageDTO[]; pagination: PagePaginationMeta }> {
    const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? "12", 10) || 12));
    const search = (query.search ?? "").trim();
    const allowedSort = ["updatedAt", "createdAt", "title"];
    const sortBy = allowedSort.includes(query.sortBy ?? "") ? (query.sortBy as string) : "updatedAt";
    const order = query.order === "asc" ? 1 : -1;

    const filter: Record<string, unknown> = { userId };
    if (search) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { slug: { $regex: escaped, $options: "i" } },
        { title: { $regex: escaped, $options: "i" } },
      ];
    }

    const { docs, total } = await this.pages.listForUser(filter, { [sortBy]: order } as Record<string, 1 | -1>, (page - 1) * limit, limit);
    const totalPages = Math.ceil(total / limit);
    return { pages: docs.map(toPageDTO), pagination: { total, page, limit, totalPages, hasMore: page < totalPages } };
  }

  async getForUser(userId: string, id: string): Promise<PageDTO | ServiceError> {
    if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
    const page = await this.pages.findLeanByIdForUser(id, userId);
    if (!page) return { status: 404, message: "Page not found." };
    return toPageDTO(page);
  }

  async updateForUser(
    userId: string,
    id: string,
    patch: { title?: string; slug?: string; theme?: unknown; blocks?: unknown },
    opts: { origin?: string } = {},
  ): Promise<PageDTO | ServiceError> {
    if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
    const page = await this.pages.findByIdForUser(id, userId);
    if (!page) return { status: 404, message: "Page not found." };

    if (patch.title !== undefined) {
      const title = patch.title.trim();
      if (title.length === 0) return { status: 400, message: "Title is required." };
      page.title = title.slice(0, 120);
    }

    let slugChanged = false;
    if (patch.slug !== undefined) {
      const slug = normalizePageSlug(patch.slug);
      const error = validatePageSlug(slug);
      if (error) return { status: 400, message: error };
      if (slug !== page.slug && (await this.pages.existsBySlug(slug, String(page._id)))) {
        return { status: 409, message: "This URL is already taken. Please choose another." };
      }
      slugChanged = slug !== page.slug;
      if (slugChanged) {
        try {
          await this.redirects.record(page._id, String(page.slug), slug);
        } catch (err) {
          console.error("[pages] redirect record:", err);
        }
      }
      page.slug = slug;
    }

    if (patch.theme !== undefined) {
      const { validatePageTheme } = await import("@/server/lib/pages");
      const errors = validatePageTheme(patch.theme);
      if (errors.length > 0) return { status: 400, message: errors.join(" ") };
      page.theme = patch.theme as IPage["theme"];
    }

    if (patch.blocks !== undefined) {
      const errors = validatePageBlocks(patch.blocks);
      if (errors.length > 0) return { status: 400, message: errors.join(" ") };
      page.blocks = patch.blocks as IPage["blocks"];
    }

    await this.pages.save(page);
    if (slugChanged && page.linkedShortCode && opts.origin) {
      const { syncShortLinkDestination } = await import("./page-shortlink.service");
      await syncShortLinkDestination(page, opts.origin, this.db);
    }
    return toPageDTO(page);
  }

  async deleteForUser(userId: string, id: string): Promise<{ message: string; id: string } | ServiceError> {
    if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
    const page = await this.pages.deleteByIdForUser(id, userId);
    if (!page) return { status: 404, message: "Page not found." };
    return { message: "Page deleted successfully", id };
  }

  async appendLinkBlock(
    userId: string,
    id: string,
    input: { label?: string; url?: string; shortCode?: string },
  ): Promise<PageDTO | ServiceError> {
    if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
    const label = (input.label ?? "").trim().slice(0, 80);
    if (!label) return { status: 400, message: "A link label is required." };
    const url = (input.url ?? "").trim();
    if (!/^https?:\/\/\S+$/i.test(url)) return { status: 400, message: "Link URL must start with http:// or https://." };

    let shortCode: string | undefined;
    if (input.shortCode !== undefined && input.shortCode !== "") {
      shortCode = String(input.shortCode).trim();
      if (!PAGE_ITEM_SHORT_CODE_RE.test(shortCode)) {
        return { status: 400, message: "Short code must be 3-50 characters (letters, numbers, hyphens only)." };
      }
    }

    const page = await this.pages.findByIdForUser(id, userId);
    if (!page) return { status: 404, message: "Page not found." };

    if (shortCode) {
      await this.db.connect();
      const link = await UrlModel.findOne({ shortCode }).lean();
      if (!link) return { status: 404, message: "Short link not found." };
      if ((link as { userId?: string }).userId !== userId) {
        return { status: 403, message: "You can only attach your own short links." };
      }
    }

    const blocks = JSON.parse(JSON.stringify(page.blocks ?? [])) as IPage["blocks"];
    const target = blocks.find((block) => block.type === "links");
    const item: Record<string, unknown> = { label, url };
    if (shortCode) item["shortCode"] = shortCode;
    if (target) {
      const props = (target.props ?? {}) as Record<string, unknown>;
      const items = Array.isArray(props["items"]) ? [...(props["items"] as unknown[])] : [];
      if (items.length >= MAX_BLOCK_ITEMS) {
        return { status: 400, message: `Link blocks support up to ${MAX_BLOCK_ITEMS} items.` };
      }
      items.push(item);
      target.props = { ...props, items };
    } else {
      if (blocks.length >= MAX_PAGE_BLOCKS) {
        return { status: 400, message: `Pages support up to ${MAX_PAGE_BLOCKS} blocks.` };
      }
      blocks.push({ key: `links-${Date.now().toString(36)}`, type: "links", position: blocks.length, visible: true, pinned: false, props: { style: "stack", items: [item] } });
    }
    const errors = validatePageBlocks(blocks);
    if (errors.length > 0) return { status: 400, message: errors[0] ?? "Invalid page blocks." };
    page.blocks = blocks;
    page.markModified("blocks");
    await this.pages.save(page);
    return toPageDTO(page);
  }

  async duplicateForUser(
    userId: string,
    id: string,
    input: { title?: string; slug?: string },
  ): Promise<PageDTO | ServiceError> {
    if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
    const source = await this.pages.findLeanByIdForUser(id, userId);
    if (!source) return { status: 404, message: "Page not found." };

    const title = input.title && input.title.trim().length > 0 ? input.title.trim().slice(0, 120) : `${source.title} copy`;

    let slug: string;
    if (input.slug && input.slug.trim().length > 0) {
      slug = normalizePageSlug(input.slug);
      const error = validatePageSlug(slug);
      if (error) return { status: 400, message: error };
      if (await this.pages.existsBySlug(slug)) {
        return { status: 409, message: "This URL is already taken. Please choose another." };
      }
    } else {
      slug = await this.suggestUniqueSlug(`${source.slug}-copy`);
    }

    const clonedBlocks = JSON.parse(JSON.stringify(source.blocks ?? [])) as IPage["blocks"];
    for (const block of clonedBlocks) {
      if (block.type !== "links") continue;
      const props = (block.props ?? {}) as Record<string, unknown>;
      if (!Array.isArray(props["items"])) continue;
      props["items"] = (props["items"] as Record<string, unknown>[]).map((item) => {
        if (typeof item !== "object" || item === null || Array.isArray(item)) return item;
        const next = { ...item };
        delete next["shortCode"];
        return next;
      });
      block.props = props;
    }
    const copy = await this.pages.create({
      userId,
      slug,
      title,
      templateId: source.templateId,
      goal: typeof source.goal === "string" ? source.goal : undefined,
      theme: JSON.parse(JSON.stringify(source.theme)),
      blocks: clonedBlocks,
      status: "draft",
      views: 0,
    });
    return toPageDTO(copy);
  }

  customSlugPattern(): RegExp {
    return CUSTOM_SLUG_RE;
  }
}

