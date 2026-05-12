import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Release } from "@/types/page";

type PublishStatus = "idle" | "publishing" | "success" | "error";

interface PublishState {
  status: PublishStatus;
  latestRelease: Release | null;
  error: string | null;
  history: Release[];
}

const initialState: PublishState = {
  status: "idle",
  latestRelease: null,
  error: null,
  history: [],
};

export const publishPage = createAsyncThunk(
  "publish/publishPage",
  async (
    { slug, page }: { slug: string; page: unknown },
    { rejectWithValue }
  ) => {
    const res = await fetch(`/api/publish/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return rejectWithValue(body.error ?? "Publish failed");
    }
    return (await res.json()) as Release;
  }
);

export const publishSlice = createSlice({
  name: "publish",
  initialState,
  reducers: {
    setLatestRelease(state, action: PayloadAction<Release>) {
      state.latestRelease = action.payload;
    },
    resetPublishStatus(state) {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(publishPage.pending, (state) => {
        state.status = "publishing";
        state.error = null;
      })
      .addCase(publishPage.fulfilled, (state, action) => {
        state.status = "success";
        state.latestRelease = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(publishPage.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload as string;
      });
  },
});

export const { setLatestRelease, resetPublishStatus } = publishSlice.actions;
export default publishSlice.reducer;
