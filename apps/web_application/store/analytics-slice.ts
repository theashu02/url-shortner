import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/eden";
import type { RootState } from "./index";
import type { AnalyticsSummaryItem, DetailedAnalytics } from "@/server/services/analytics";

export interface AnalyticsState {
  summaryList: AnalyticsSummaryItem[];
  summaryLoading: boolean;
  summaryError: string | null;

  detailedData: DetailedAnalytics | null;
  detailedLoading: boolean;
  detailedError: string | null;
}

const initialState: AnalyticsState = {
  summaryList: [],
  summaryLoading: false,
  summaryError: null,

  detailedData: null,
  detailedLoading: false,
  detailedError: null,
};

function extractErrorMessage(res: unknown): string {
  if (res && typeof res === "object" && "error" in res && (res as any).error) {
    const errVal = (res as any).error?.value;
    if (errVal && typeof errVal === "object" && "message" in errVal) {
      return String(errVal.message);
    }
  }
  return "An error occurred";
}

export const fetchAnalyticsSummary = createAsyncThunk<
  AnalyticsSummaryItem[],
  void,
  { state: RootState }
>("analytics/fetchSummary", async () => {
  const res = await api.analytics.summary.get();
  
  if (Array.isArray(res.data)) {
    return res.data as AnalyticsSummaryItem[];
  }
  if (res.error) {
    throw new Error(extractErrorMessage(res));
  }
  throw new Error("Failed to load analytics summary");
});

export const fetchLinkAnalytics = createAsyncThunk<
  DetailedAnalytics,
  string,
  { state: RootState }
>("analytics/fetchDetailed", async (shortCode) => {
  const res = await api.analytics({ shortCode }).get();

  if (res.data && "totalClicks" in res.data) {
    return res.data as unknown as DetailedAnalytics;
  }
  if (res.data && "message" in res.data) {
    throw new Error(String((res.data as any).message));
  }
  if (res.error) {
    throw new Error(extractErrorMessage(res));
  }
  throw new Error("Failed to load detailed analytics");
});

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearDetailedAnalytics(state) {
      state.detailedData = null;
      state.detailedError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Summary List
      .addCase(fetchAnalyticsSummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })
      .addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
        state.summaryList = action.payload;
        state.summaryLoading = false;
      })
      .addCase(fetchAnalyticsSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError = action.error.message ?? "Failed to connect to the server.";
      })
      // Detailed Analytics
      .addCase(fetchLinkAnalytics.pending, (state) => {
        state.detailedLoading = true;
        state.detailedError = null;
      })
      .addCase(fetchLinkAnalytics.fulfilled, (state, action) => {
        state.detailedData = action.payload;
        state.detailedLoading = false;
      })
      .addCase(fetchLinkAnalytics.rejected, (state, action) => {
        state.detailedLoading = false;
        state.detailedError = action.error.message ?? "Failed to connect to the server.";
      });
  },
});

export const { clearDetailedAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
