import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/lib/eden";
import type { LinkItem } from "@/components/my-links/types";
import type { RootState } from "./index";

export interface MyLinksState {
  links: LinkItem[];
  totalCount: number;
  page: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;

  search: string;
  debouncedSearch: string;
  sortBy: "createdAt" | "clicks";
  sortOrder: "desc" | "asc";

  editingLink: LinkItem | null;
  qrLink: LinkItem | null;
  deletingId: string | null;
  copiedId: string | null;

  /** Cache key built from (debouncedSearch, sortBy, sortOrder, page). */
  lastFetchKey: string | null;
}

const initialState: MyLinksState = {
  links: [],
  totalCount: 0,
  page: 1,
  hasMore: false,
  loading: true,
  loadingMore: false,
  error: null,

  search: "",
  debouncedSearch: "",
  sortBy: "createdAt",
  sortOrder: "desc",

  editingLink: null,
  qrLink: null,
  deletingId: null,
  copiedId: null,

  lastFetchKey: null,
};

function buildCacheKey(
  debouncedSearch: string,
  sortBy: string,
  sortOrder: string,
  page: number,
) {
  return `${debouncedSearch}|${sortBy}|${sortOrder}|${page}`;
}

function extractErrorMessage(res: unknown): string {
  if (
    res &&
    typeof res === "object" &&
    "error" in res &&
    (res as Record<string, unknown>).error
  ) {
    const errVal = ((res as Record<string, unknown>).error as Record<string, unknown>)?.value;
    if (errVal && typeof errVal === "object" && "message" in errVal) {
      return String((errVal as { message: unknown }).message);
    }
  }
  return "An error occurred";
}

interface FetchLinksArg {
  page?: number;
  append?: boolean;
  /** When true, skip the cache check and force a fresh fetch. */
  force?: boolean;
}

export const fetchLinks = createAsyncThunk<
  { links: LinkItem[]; total: number; hasMore: boolean; page: number; append: boolean },
  FetchLinksArg,
  { state: RootState }
>(
  "myLinks/fetchLinks",
  async ({ page = 1, append = false }, { getState }) => {
    const { debouncedSearch, sortBy, sortOrder } = getState().myLinks;

    const res = await api.url["my-links"].get({
      query: {
        page: page.toString(),
        limit: "15",
        search: debouncedSearch || undefined,
        sortBy,
        order: sortOrder,
      },
    });

    if (
      res.data &&
      "links" in res.data &&
      "pagination" in res.data &&
      res.data.pagination
    ) {
      const newLinks = res.data.links as LinkItem[];
      const pagination = res.data.pagination;
      return {
        links: newLinks,
        total: pagination.total,
        hasMore: pagination.hasMore,
        page,
        append,
      };
    }

    if (res.data && "message" in res.data) {
      throw new Error(String(res.data.message));
    }
    if (res.error) {
      throw new Error(extractErrorMessage(res));
    }
    throw new Error("Failed to load links");
  },
  {
    // Prevent duplicate in-flight requests and cache hits
    condition: ({ page = 1, append = false, force = false }, { getState }) => {
      const state = getState().myLinks;

      // If a fetch is already in progress, skip (unless initial load)
      if (state.lastFetchKey !== null && (append ? state.loadingMore : state.loading)) {
        return false;
      }

      // If not forced, check cache key
      if (!force) {
        const key = buildCacheKey(state.debouncedSearch, state.sortBy, state.sortOrder, page);
        if (state.lastFetchKey === key && state.links.length > 0) return false;
      }

      return true;
    },
  },
);

export const updateLink = createAsyncThunk<
  LinkItem,
  { id: string; url: string; slug: string },
  { state: RootState }
>("myLinks/updateLink", async ({ id, url, slug }) => {
  const res = await api.url.update.patch({
    id,
    url,
    customSlug: slug || undefined,
  });

  if (res.data && "link" in res.data) {
    return res.data.link as LinkItem;
  }
  if (res.data && "message" in res.data) {
    throw new Error(String(res.data.message));
  }
  if (res.error) {
    throw new Error(extractErrorMessage(res));
  }
  throw new Error("Failed to update link");
});

export const deleteLink = createAsyncThunk<
  string,
  string,
  { state: RootState }
>("myLinks/deleteLink", async (id) => {
  const res = await api.url.remove({ id }).delete();
  if (res.data && "message" in res.data) {
    return id;
  }
  throw new Error("Failed to delete link");
});

const myLinksSlice = createSlice({
  name: "myLinks",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setDebouncedSearch(state, action: PayloadAction<string>) {
      state.debouncedSearch = action.payload;
    },
    setSortBy(state, action: PayloadAction<"createdAt" | "clicks">) {
      state.sortBy = action.payload;
      state.sortOrder = "desc";
    },
    setSortOrder(state, action: PayloadAction<"desc" | "asc">) {
      state.sortOrder = action.payload;
    },
    toggleSortOrder(state) {
      state.sortOrder = state.sortOrder === "desc" ? "asc" : "desc";
    },
    setEditingLink(state, action: PayloadAction<LinkItem | null>) {
      state.editingLink = action.payload;
    },
    setQrLink(state, action: PayloadAction<LinkItem | null>) {
      state.qrLink = action.payload;
    },
    setCopiedId(state, action: PayloadAction<string | null>) {
      state.copiedId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLinks.pending, (state, action) => {
        const append = action.meta.arg.append ?? false;
        if (append) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchLinks.fulfilled, (state, action) => {
        const { links, total, hasMore, page, append } = action.payload;
        state.links = append ? [...state.links, ...links] : links;
        state.totalCount = total;
        state.hasMore = hasMore;
        state.page = page;
        state.loading = false;
        state.loadingMore = false;
        state.lastFetchKey = buildCacheKey(
          state.debouncedSearch,
          state.sortBy,
          state.sortOrder,
          page,
        );
      })
      .addCase(fetchLinks.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.error.message ?? "Failed to connect to the server.";
      });

    // updateLink
    builder
      .addCase(updateLink.fulfilled, (state, action) => {
        const updated = action.payload;
        state.links = state.links.map((item) =>
          item._id === updated._id ? updated : item,
        );
        state.editingLink = null;
      });

    // deleteLink
    builder
      .addCase(deleteLink.pending, (state, action) => {
        state.deletingId = action.meta.arg;
      })
      .addCase(deleteLink.fulfilled, (state, action) => {
        const id = action.payload;
        state.links = state.links.filter((item) => item._id !== id);
        state.totalCount = Math.max(0, state.totalCount - 1);
        state.deletingId = null;
      })
      .addCase(deleteLink.rejected, (state) => {
        state.deletingId = null;
      });
  },
});

export const {
  setSearch,
  setDebouncedSearch,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
  setEditingLink,
  setQrLink,
  setCopiedId,
} = myLinksSlice.actions;

export default myLinksSlice.reducer;
