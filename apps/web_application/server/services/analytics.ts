import { container } from "@/server/core/container";

export type {
  AnalyticsSummaryItem,
  BreakdownItem,
  DetailedAnalytics,
} from "@/server/modules/analytics/analytics.service";

/** Backward-compatible facade over AnalyticsService (OOP). */
export const getAnalyticsSummary = container.analyticsService.getAnalyticsSummary.bind(container.analyticsService);
export const getLinkAnalytics = container.analyticsService.getLinkAnalytics.bind(container.analyticsService);
