import { container } from "@/server/core/container";

/**
 * Backward-compatible functional facade over UrlService (OOP).
 * New code should inject UrlService; this module preserves existing imports.
 */
export const createShortUrl = container.urlService.createShortUrl.bind(container.urlService);
export const getUserLinks = container.urlService.getUserLinks.bind(container.urlService);
export const updateLink = container.urlService.updateLink.bind(container.urlService);
export const deleteLink = container.urlService.deleteLink.bind(container.urlService);
export { container as urlContainer };
