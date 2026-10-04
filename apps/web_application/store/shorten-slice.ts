import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/eden";

interface ShortenState {
  loading: boolean;
  errorMsg: string;
}

const initialState: ShortenState = {
  loading: false,
  errorMsg: "",
};

export const createShortLink = createAsyncThunk(
  "shorten/create",
  async (url: string) => {
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const res = await api.url.create.post({ url: formattedUrl });
    
    if (res.error) {
      const errObj = res.error.value as { message?: string };
      throw new Error(errObj?.message || "Failed to shorten URL. Try again.");
    }
    
    if (res.data && "shortCode" in res.data) {
      return res.data.shortCode as string;
    }
    
    throw new Error("Invalid response from server");
  }
);

const shortenSlice = createSlice({
  name: "shorten",
  initialState,
  reducers: {
    clearError(state) {
      state.errorMsg = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createShortLink.pending, (state) => {
        state.loading = true;
        state.errorMsg = "";
      })
      .addCase(createShortLink.fulfilled, (state) => {
        state.loading = false;
        state.errorMsg = "";
      })
      .addCase(createShortLink.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.error.message || "An unexpected error occurred.";
      });
  },
});

export const { clearError } = shortenSlice.actions;
export default shortenSlice.reducer;
