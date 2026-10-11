import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "@/lib/eden";
import { SHORT_CODE_RE, urlRegex } from "@/lib/constant";
import type { RootState } from "./index";

export type ComposerMode = "link" | "qr" | "both";

export interface UtmState {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

export interface CustomLinkResult {
  shortCode: string;
  originalUrl: string;
}

export type ComposerStatus = "idle" | "loading" | "succeeded" | "failed";

interface CustomLinksState {
  mode: ComposerMode;
  destinationUrl: string;
  slug: string;
  utmParams: UtmState | null;
  expiresAt: string | null;
  deviceCapture: boolean;
  status: ComposerStatus;
  error: string | null;
  result: CustomLinkResult | null;
}

const initialState: CustomLinksState = {
  mode: "link",
  destinationUrl: "",
  slug: "",
  utmParams: null,
  expiresAt: null,
  deviceCapture: false,
  status: "idle",
  error: null,
  result: null,
};

const EMPTY_UTM: UtmState = { source: "", medium: "", campaign: "", term: "", content: "" };

function hasUtmValues(utm: UtmState | null): utm is UtmState {
  if (!utm) return false;
  return Object.values(utm).some((value) => value.trim().length > 0);
}

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || !urlRegex.test(trimmed)) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function extractErrorMessage(res: unknown): string {
  if (res && typeof res === "object") {
    if ("message" in res && typeof (res as { message: unknown }).message === "string") {
      return (res as { message: string }).message;
    }
    if ("error" in res && (res as Record<string, unknown>).error) {
      const errVal = ((res as Record<string, unknown>).error as Record<string, unknown>)?.value;
      if (errVal && typeof errVal === "object" && "message" in errVal) {
        return String((errVal as { message: unknown }).message);
      }
    }
  }
  return "Failed to create link. Try again.";
}

export const createCustomLink = createAsyncThunk<
  CustomLinkResult,
  void,
  { state: RootState; rejectValue: string }
>(
  "customLinks/create",
  async (_, { getState, rejectWithValue }) => {
    const { mode, destinationUrl, slug, utmParams, expiresAt, deviceCapture } =
      getState().customLinks;

    const url = normalizeUrl(destinationUrl);
    if (!url) return rejectWithValue("Please enter a valid destination URL.");

    const cleanSlug = slug.trim();
    if (mode !== "qr" && cleanSlug && !SHORT_CODE_RE.test(cleanSlug)) {
      return rejectWithValue(
        "Custom slug must be 3-32 chars: letters, numbers, hyphens, underscores.",
      );
    }

    const res = await api.url.create.post({
      url,
      ...(mode !== "qr" && cleanSlug ? { customSlug: cleanSlug } : {}),
      ...(hasUtmValues(utmParams) ? { utmParams } : {}),
      ...(expiresAt ? { expiresAt } : {}),
      ...(deviceCapture ? { deviceCapture: true } : {}),
    });

    if (res.data && "shortCode" in res.data && "originalUrl" in res.data) {
      return {
        shortCode: String((res.data as { shortCode: unknown }).shortCode),
        originalUrl: String((res.data as { originalUrl: unknown }).originalUrl),
      };
    }

    return rejectWithValue(extractErrorMessage(res.data ?? res.error));
  },
  {
    condition: (_, { getState }) => getState().customLinks.status !== "loading",
  },
);

const customLinksSlice = createSlice({
  name: "customLinks",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<ComposerMode>) {
      if (state.mode === action.payload) return;
      state.mode = action.payload;
      state.status = "idle";
      state.error = null;
      state.result = null;
    },
    setDestinationUrl(state, action: PayloadAction<string>) {
      state.destinationUrl = action.payload;
      if (state.error) state.error = null;
    },
    setSlug(state, action: PayloadAction<string>) {
      state.slug = action.payload.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
      if (state.error) state.error = null;
    },
    setUtmParams(state, action: PayloadAction<UtmState | null>) {
      state.utmParams = action.payload;
    },
    setExpiresAt(state, action: PayloadAction<string | null>) {
      state.expiresAt = action.payload;
    },
    setDeviceCapture(state, action: PayloadAction<boolean>) {
      state.deviceCapture = action.payload;
    },
    setFormError(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
    resetComposer(state) {
      state.status = "idle";
      state.error = null;
      state.result = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCustomLink.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createCustomLink.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.result = action.payload;
      })
      .addCase(createCustomLink.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Failed to create link. Try again.";
      });
  },
});

export const {
  setMode,
  setDestinationUrl,
  setSlug,
  setUtmParams,
  setExpiresAt,
  setDeviceCapture,
  setFormError,
  resetComposer,
} = customLinksSlice.actions;

export default customLinksSlice.reducer;

export const selectComposer = (state: RootState) => state.customLinks;

export const selectActiveOptionCount = createSelector(
  [(state: RootState) => state.customLinks],
  (composer) =>
    (hasUtmValues(composer.utmParams) ? 1 : 0) +
    (composer.expiresAt ? 1 : 0) +
    (composer.deviceCapture ? 1 : 0) +
    (composer.mode !== "qr" && composer.slug.trim() ? 1 : 0),
);

export { EMPTY_UTM };
