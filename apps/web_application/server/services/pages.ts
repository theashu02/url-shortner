import { container } from "@/server/core/container";

export type {
  PageBlockDTO,
  PageDTO,
  PagePaginationMeta,
  PageVersionDTO,
  PublishedPageDTO,
  PageTrackingInfo,
  PageTopBlock,
  PageAnalytics,
  ServiceError,
} from "@/server/modules/pages/page.types";
export { PAGES_RATE_LIMITS } from "@/server/modules/pages/page.controller";
export { toPageDTO, toThemeDTO } from "@/server/modules/pages/page.mapper";

/**
 * Backward-compatible functional facade over PageService (OOP).
 * New code should inject PageService; this module preserves existing imports.
 */
const pages = container.pageService;

export const checkPageSlugAvailability = pages.checkSlugAvailability.bind(pages);
export const checkPagesRateLimit = (
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> => container.rateLimiter.check(key, limit, windowSeconds);
export const createPageFromTemplate = pages.createFromTemplate.bind(pages);
export const listUserPages = pages.listForUser.bind(pages);
export const appendPageLinkBlock = pages.appendLinkBlock.bind(pages);
export const getUserPage = pages.getForUser.bind(pages);
export const updateUserPage = pages.updateForUser.bind(pages);
export const deleteUserPage = pages.deleteForUser.bind(pages);
export const duplicateUserPage = pages.duplicateForUser.bind(pages);
export const publishUserPage = pages.publishForUser.bind(pages);
export const unpublishUserPage = pages.unpublishForUser.bind(pages);
export const listPageVersions = pages.listVersionsForUser.bind(pages);
export const getPageVersion = pages.getVersionForUser.bind(pages);
export const recordPageSlugRedirect = (
  pageId: unknown,
  oldSlug: string,
  newSlug: string,
): Promise<void> => container.pageRedirectRepository.record(pageId, oldSlug, newSlug);
export const resolvePageSlugRedirect = pages.resolveRedirect.bind(pages);
export const getPublishedPageBySlug = pages.getPublishedBySlug.bind(pages);
export const recordPageView = pages.recordView.bind(pages);
export const recordPageClick = pages.recordClick.bind(pages);
export const getPageAnalytics = pages.getAnalytics.bind(pages);
export const ensurePageShortLink = pages.ensureShortLink.bind(pages);
export const removePageShortLink = pages.removeShortLink.bind(pages);

