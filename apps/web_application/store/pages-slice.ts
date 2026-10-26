import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/lib/eden";
import { extractApiMessage } from "@/lib/apiError";
import type { PageDTO } from "@/server/services/pages";
import type { PageSnapshotLike } from "@/server/lib/pages";
import type { RootState } from "./index";

export interface PagesState {
  pages: PageDTO[];
  total: number;
  loading: boolean;
  error: string | null;
  search: string;
  debouncedSearch: string;
  previewPage: PageDTO | null;
  sharePage: PageDTO | null;
  deleteTarget: PageDTO | null;
  duplicatingId: string | null;
  deleting: boolean;
  creating: boolean;
  createError: string | null;
  lastFetchKey: string | null;
  pickerPages: PickerPage[];
  pickerLoading: boolean;
  pickerError: string | null;
  appending: boolean;
  appendError: string | null;
  appendedPageId: string | null;
  liveSnapshot: PageSnapshotLike | null;
  liveSnapshotPageId: string | null;
}

export interface PickerPage {
  _id: string;
  title: string;
  slug: string;
  status: string;
}

const initialState: PagesState = {
  pages: [],
  total: 0,
  loading: true,
  error: null,
  search: "",
  debouncedSearch: "",
  previewPage: null,
  sharePage: null,
  deleteTarget: null,
  duplicatingId: null,
  deleting: false,
  creating: false,
  createError: null,
  lastFetchKey: null,
  pickerPages: [],
  pickerLoading: false,
  pickerError: null,
  appending: false,
  appendError: null,
  appendedPageId: null,
  liveSnapshot: null,
  liveSnapshotPageId: null,
};

export const fetchPages = createAsyncThunk<
  { pages: PageDTO[]; total: number },
  { force?: boolean },
  { state: RootState }
>(
  "pages/fetchPages",
  async (_, { getState }) => {
    const { debouncedSearch } = getState().pages;
    const res = await api.pages.mine.get({
      query: {
        page: "1",
        limit: "24",
        search: debouncedSearch || undefined,
        sortBy: "updatedAt",
        order: "desc",
      },
    });
    if (res.data && "pages" in res.data && Array.isArray(res.data.pages)) {
      const pagination = res.data.pagination as { total?: unknown } | undefined;
      return {
        pages: res.data.pages as PageDTO[],
        total: Number(pagination?.total ?? 0),
      };
    }
    throw new Error(extractApiMessage(res, "Failed to load pages"));
  },
  {
    condition: ({ force = false }, { getState }) => {
      const state = getState().pages;
      if (state.lastFetchKey !== null && state.loading) return false;
      if (!force && state.lastFetchKey === state.debouncedSearch && state.pages.length > 0) {
        return false;
      }
      return true;
    },
  }
);

export const duplicatePage = createAsyncThunk<PageDTO, string, { state: RootState }>(
  "pages/duplicatePage",
  async (id, { getState }) => {
    const res = await api.pages({ id }).duplicate.post({});
    if (res.data && "page" in res.data && res.data.page) {
      return res.data.page as unknown as PageDTO;
    }
    const pages = getState().pages.pages;
    const title = pages.find((page) => page._id === id)?.title ?? "Page";
    throw new Error(extractApiMessage(res, "Could not duplicate \"" + title + "\"."));
  }
);

export interface CreatePageFromTemplateInput {
  templateId: string;
  title: string;
  slug: string;
  goal?: string;
  initialUrl?: string;
}

export const createPageFromTemplate = createAsyncThunk<PageDTO, CreatePageFromTemplateInput>(
  "pages/createPageFromTemplate",
  async (input) => {
    const res = await api.pages.post({
      templateId: input.templateId,
      title: input.title,
      slug: input.slug,
      ...(input.goal ? { goal: input.goal } : {}),
      ...(input.initialUrl ? { initialUrl: input.initialUrl } : {}),
    });
    if (res.data && "page" in res.data && res.data.page) {
      return res.data.page as unknown as PageDTO;
    }
    throw new Error(extractApiMessage(res, "Could not create the page."));
  }
);

export const trackBlockClick = createAsyncThunk<
  void,
  { pageId: string; blockKey: string; referrer?: string }
>(
  "pages/trackBlockClick",
  async ({ pageId, blockKey, referrer }) => {
    try {
      await api.pages({ id: pageId }).click.post(
        { blockKey, referrer },
        { fetch: { keepalive: true } }
      );
    } catch {
      // Fire-and-forget: click analytics must never break the visitor flow.
    }
  }
);

export const deletePage = createAsyncThunk<string, string>(
  "pages/deletePage",
  async (id) => {
    const res = await api.pages({ id }).delete();
    if (res.data && "message" in res.data) return id;
    throw new Error(extractApiMessage(res, "Could not delete the page."));
  }
);

export const fetchPickerPages = createAsyncThunk<PickerPage[]>(
  "pages/fetchPickerPages",
  async () => {
    const res = await api.pages.mine.get({ query: { limit: "50" } });
    if (res.data && "pages" in res.data && Array.isArray(res.data.pages)) {
      return (res.data.pages as PageDTO[]).map((page) => ({
        _id: String(page._id),
        title: String(page.title),
        slug: String(page.slug),
        status: String(page.status),
      }));
    }
    throw new Error(extractApiMessage(res, "Could not load your pages."));
  }
);

export const appendLinkToPage = createAsyncThunk<
  string,
  { pageId: string; label: string; url: string; shortCode: string }
>(
  "pages/appendLinkToPage",
  async ({ pageId, label, url, shortCode }) => {
    const res = await api.pages({ id: pageId })["append-link"].post({
      label,
      url,
      shortCode,
    });
    if (res.data && "page" in res.data && res.data.page) return pageId;
    throw new Error(extractApiMessage(res, "Could not add the link to the page."));
  }
);

const liveSnapshotInflight = new Map<string, Promise<{ pageId: string; snapshot: PageSnapshotLike | null }>>();

export const fetchLiveSnapshot = createAsyncThunk<
  { pageId: string; snapshot: PageSnapshotLike | null },
  string
>(
  "pages/fetchLiveSnapshot",
  async (pageId) => {
    const running = liveSnapshotInflight.get(pageId);
    if (running) return running;
    const request = (async () => {
      const res = await api.pages({ id: pageId }).versions.get();
      if (res.data && "versions" in res.data && Array.isArray(res.data.versions)) {
        const latest = (res.data.versions as { snapshot?: unknown }[])[0];
        if (latest && typeof latest.snapshot === "object" && latest.snapshot !== null) {
          return { pageId, snapshot: latest.snapshot as PageSnapshotLike };
        }
      }
      return { pageId, snapshot: null };
    })();
    liveSnapshotInflight.set(pageId, request);
    try {
      return await request;
    } finally {
      if (liveSnapshotInflight.get(pageId) === request) liveSnapshotInflight.delete(pageId);
    }
  }
);

const pagesSlice = createSlice({
  name: "pages",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setDebouncedSearch(state, action: PayloadAction<string>) {
      state.debouncedSearch = action.payload;
    },
    setPreviewPage(state, action: PayloadAction<PageDTO | null>) {
      state.previewPage = action.payload;
    },
    setSharePage(state, action: PayloadAction<PageDTO | null>) {
      state.sharePage = action.payload;
    },
    setDeleteTarget(state, action: PayloadAction<PageDTO | null>) {
      state.deleteTarget = action.payload;
    },
    clearLiveSnapshot(state) {
      state.liveSnapshot = null;
      state.liveSnapshotPageId = null;
    },
    resetPagePicker(state) {
      state.pickerPages = [];
      state.pickerLoading = false;
      state.pickerError = null;
      state.appending = false;
      state.appendError = null;
      state.appendedPageId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.pages = action.payload.pages;
        state.total = action.payload.total;
        state.loading = false;
        state.lastFetchKey = state.debouncedSearch;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load pages";
      })
      .addCase(duplicatePage.pending, (state, action) => {
        state.duplicatingId = action.meta.arg;
      })
      .addCase(duplicatePage.fulfilled, (state, action) => {
        state.pages = [action.payload, ...state.pages];
        state.total += 1;
        state.duplicatingId = null;
      })
      .addCase(duplicatePage.rejected, (state) => {
        state.duplicatingId = null;
      })
      .addCase(createPageFromTemplate.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createPageFromTemplate.fulfilled, (state, action) => {
        state.pages = [action.payload, ...state.pages];
        state.total += 1;
        state.creating = false;
        state.lastFetchKey = null;
      })
      .addCase(createPageFromTemplate.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.error.message ?? "Could not create the page.";
      })
      .addCase(deletePage.pending, (state) => {
        state.deleting = true;
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        state.pages = state.pages.filter((page) => page._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
        state.deleting = false;
        state.deleteTarget = null;
      })
      .addCase(deletePage.rejected, (state) => {
        state.deleting = false;
      })
      .addCase(fetchPickerPages.pending, (state) => {
        state.pickerLoading = true;
        state.pickerError = null;
      })
      .addCase(fetchPickerPages.fulfilled, (state, action) => {
        state.pickerPages = action.payload;
        state.pickerLoading = false;
      })
      .addCase(fetchPickerPages.rejected, (state, action) => {
        state.pickerLoading = false;
        state.pickerError = action.error.message ?? "Could not load your pages.";
      })
      .addCase(appendLinkToPage.pending, (state) => {
        state.appending = true;
        state.appendError = null;
      })
      .addCase(appendLinkToPage.fulfilled, (state, action) => {
        state.appending = false;
        state.appendedPageId = action.payload;
      })
      .addCase(appendLinkToPage.rejected, (state, action) => {
        state.appending = false;
        state.appendError = action.error.message ?? "Could not add the link to the page.";
      })
      .addCase(fetchLiveSnapshot.pending, (state, action) => {
        state.liveSnapshot = null;
        state.liveSnapshotPageId = action.meta.arg;
      })
      .addCase(fetchLiveSnapshot.fulfilled, (state, action) => {
        if (action.meta.arg !== state.liveSnapshotPageId) return;
        state.liveSnapshot = action.payload.snapshot;
      });
  },
});

export const {
  setSearch,
  setDebouncedSearch,
  setPreviewPage,
  setSharePage,
  setDeleteTarget,
  resetPagePicker,
  clearLiveSnapshot,
} = pagesSlice.actions;

export default pagesSlice.reducer;
