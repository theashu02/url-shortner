import type { PageStatus, PageTheme } from "@/server/lib/pages";

export type PageBlockDTO = {
  key: string;
  type: string;
  position: number;
  visible: boolean;
  pinned: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  props: Record<string, unknown>;
};

export type PageDTO = {
  _id: string;
  slug: string;
  title: string;
  templateId: string;
  goal?: string;
  theme: PageTheme;
  blocks: PageBlockDTO[];
  status: PageStatus;
  publishedVersionId?: string;
  linkedShortCode?: string;
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
};

export type PagePaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
};

export type PageVersionDTO = {
  _id: string;
  pageId: string;
  version: number;
  snapshot: { title: string; theme: PageTheme; blocks: PageBlockDTO[] };
  createdBy: string;
  createdAt: string;
};

export type PublishedPageDTO = {
  pageId: string;
  slug: string;
  title: string;
  theme: PageTheme;
  blocks: PageBlockDTO[];
  version: number;
  views: number;
  updatedAt: string;
};

export type ServiceError = { status: number; message: string };

export type PageTrackingInfo = {
  deviceType?: string;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
};

export type PageTopBlock = {
  key: string;
  type: string;
  label: string;
  count: number;
};

export type PageAnalytics = {
  page: {
    id: string;
    title: string;
    slug: string;
    status: PageStatus;
    views: number;
    clicks: number;
    linkedShortCode?: string;
  };
  range: { days: number; since: string };
  totals: { views: number; clicks: number; uniqueVisitors: number };
  timeline: { date: string; count: number }[];
  clicksTimeline: { date: string; count: number }[];
  devices: { id: string; count: number }[];
  referrers: { id: string; count: number }[];
  topBlocks: PageTopBlock[];
};
