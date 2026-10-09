import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/eden";
import type { RootState } from "./index";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  provider: string;
  emailVerified: boolean;
  handle: string | null;
  country: string | null;
  bio: string | null;
  subscription: "free" | "pro" | null;
  loginCount: number;
  lastLoginAt: string | null;
  createdAt: string | null;
}

export interface UpdateProfileArg {
  name: string;
  handle: string;
  bio: string;
}

export interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  uploadingImage: boolean;
  error: string | null;
  isModalOpen: boolean;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  saving: false,
  uploadingImage: false,
  error: null,
  isModalOpen: false,
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

export const fetchProfile = createAsyncThunk<UserProfile, void, { state: RootState }>(
  "profile/fetchProfile",
  async () => {
    const res = await api.user.me.get();

    if (res.data && "id" in res.data) {
      return res.data as unknown as UserProfile;
    }
    if (res.data && "message" in res.data) {
      throw new Error(String((res.data as any).message));
    }
    if (res.error) {
      throw new Error(extractErrorMessage(res));
    }
    throw new Error("Failed to load profile");
  },
  {
    condition: (_, { getState }) => {
      if (getState().profile.loading) return false;
    },
  }
);

export const updateProfile = createAsyncThunk<UserProfile, UpdateProfileArg, { state: RootState }>(
  "profile/updateProfile",
  async (payload) => {
    const res = await api.user.update.patch(payload);

    if (res.data && "id" in res.data) {
      return res.data as unknown as UserProfile;
    }
    if (res.data && "message" in res.data) {
      throw new Error(String((res.data as any).message));
    }
    if (res.error) {
      throw new Error(extractErrorMessage(res));
    }
    throw new Error("Failed to update profile");
  }
);

export const uploadProfileImage = createAsyncThunk<UserProfile, File, { state: RootState }>(
  "profile/uploadProfileImage",
  async (file) => {
    const res = await api.user.image.patch({ imageFile: file });

    if (res.data && "id" in res.data) {
      return res.data as unknown as UserProfile;
    }
    if (res.data && "message" in res.data) {
      throw new Error(String((res.data as any).message));
    }
    if (res.error) {
      throw new Error(extractErrorMessage(res));
    }
    throw new Error("Failed to upload image");
  }
);

export const deleteProfileImage = createAsyncThunk<UserProfile, void, { state: RootState }>(
  "profile/deleteProfileImage",
  async () => {
    const res = await api.user.image.delete();

    if (res.data && "id" in res.data) {
      return res.data as unknown as UserProfile;
    }
    if (res.data && "message" in res.data) {
      throw new Error(String((res.data as any).message));
    }
    if (res.error) {
      throw new Error(extractErrorMessage(res));
    }
    throw new Error("Failed to delete image");
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileModalOpen(state, action: { payload: boolean }) {
      state.isModalOpen = action.payload;
      if (!action.payload) state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to connect to the server.";
      })
      .addCase(updateProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.saving = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? "Failed to connect to the server.";
      })
      .addCase(uploadProfileImage.pending, (state) => {
        state.uploadingImage = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.uploadingImage = false;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.uploadingImage = false;
        state.error = action.error.message ?? "Failed to upload image.";
      })
      .addCase(deleteProfileImage.pending, (state) => {
        state.uploadingImage = true;
        state.error = null;
      })
      .addCase(deleteProfileImage.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.uploadingImage = false;
      })
      .addCase(deleteProfileImage.rejected, (state, action) => {
        state.uploadingImage = false;
        state.error = action.error.message ?? "Failed to delete image.";
      });
  },
});

export const { setProfileModalOpen } = profileSlice.actions;
export default profileSlice.reducer;
