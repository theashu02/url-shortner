import type { PageCrudService } from "./page-crud.service";
import type { PagePublishService } from "./page-publish.service";
import type { PageTrackingService } from "./page-tracking.service";
import type { PageShortLinkService } from "./page-shortlink.service";
import type { PageTrackingInfo, PublishedPageDTO } from "./page.types";

/**
 * Facade over the focused page services (SRP per collaborator).
 * Preserves the legacy `services/pages` method names so existing callers
 * keep working while new code depends on this single interface (DIP/OCP).
 */
export class PageService {
  constructor(
    private readonly crud: PageCrudService,
    private readonly publishing: PagePublishService,
    private readonly tracking: PageTrackingService,
    private readonly shortLinks: PageShortLinkService,
  ) {}

  checkSlugAvailability = (...args: Parameters<PageCrudService["checkSlugAvailability"]>) =>
    this.crud.checkSlugAvailability(...args);

  createFromTemplate = (...args: Parameters<PageCrudService["createFromTemplate"]>) =>
    this.crud.createFromTemplate(...args);

  listForUser = (...args: Parameters<PageCrudService["listForUser"]>) => this.crud.listForUser(...args);
  getForUser = (...args: Parameters<PageCrudService["getForUser"]>) => this.crud.getForUser(...args);
  updateForUser = (...args: Parameters<PageCrudService["updateForUser"]>) => this.crud.updateForUser(...args);
  deleteForUser = (...args: Parameters<PageCrudService["deleteForUser"]>) => this.crud.deleteForUser(...args);
  appendLinkBlock = (...args: Parameters<PageCrudService["appendLinkBlock"]>) => this.crud.appendLinkBlock(...args);
  duplicateForUser = (...args: Parameters<PageCrudService["duplicateForUser"]>) => this.crud.duplicateForUser(...args);

  publishForUser = (...args: Parameters<PagePublishService["publishForUser"]>) => this.publishing.publishForUser(...args);
  unpublishForUser = (...args: Parameters<PagePublishService["unpublishForUser"]>) =>
    this.publishing.unpublishForUser(...args);
  listVersionsForUser = (...args: Parameters<PagePublishService["listVersionsForUser"]>) =>
    this.publishing.listVersionsForUser(...args);
  getVersionForUser = (...args: Parameters<PagePublishService["getVersionForUser"]>) =>
    this.publishing.getVersionForUser(...args);

  getPublishedBySlug = (rawSlug: string): Promise<PublishedPageDTO | null> => this.tracking.getPublishedBySlug(rawSlug);
  resolveRedirect = (rawSlug: string): Promise<string | null> => this.tracking.resolveRedirect(rawSlug);
  recordView = (pageId: string, slug: string, info?: PageTrackingInfo) => this.tracking.recordView(pageId, slug, info);
  recordClick = (...args: Parameters<PageTrackingService["recordClick"]>) => this.tracking.recordClick(...args);
  getAnalytics = (...args: Parameters<PageTrackingService["getAnalytics"]>) => this.tracking.getAnalytics(...args);

  ensureShortLink = (...args: Parameters<PageShortLinkService["ensureForUser"]>) =>
    this.shortLinks.ensureForUser(...args);
  removeShortLink = (...args: Parameters<PageShortLinkService["removeForUser"]>) =>
    this.shortLinks.removeForUser(...args);
}
