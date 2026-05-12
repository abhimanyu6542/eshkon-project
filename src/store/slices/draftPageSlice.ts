import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Page, Section } from "@/types/page";

interface DraftPageState {
  page: Page | null;
  isDirty: boolean;
}

const initialState: DraftPageState = {
  page: null,
  isDirty: false,
};

export const draftPageSlice = createSlice({
  name: "draftPage",
  initialState,
  reducers: {
    loadPage(state, action: PayloadAction<Page>) {
      state.page = action.payload;
      state.isDirty = false;
    },
    updatePageTitle(state, action: PayloadAction<string>) {
      if (!state.page) return;
      state.page.title = action.payload;
      state.isDirty = true;
    },
    addSection(state, action: PayloadAction<Section>) {
      if (!state.page) return;
      state.page.sections.push(action.payload);
      state.isDirty = true;
    },
    removeSection(state, action: PayloadAction<string>) {
      if (!state.page) return;
      state.page.sections = state.page.sections.filter(
        (s) => s.id !== action.payload
      );
      state.isDirty = true;
    },
    reorderSections(
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) {
      if (!state.page) return;
      const { fromIndex, toIndex } = action.payload;
      const sections = [...state.page.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      state.page.sections = sections;
      state.isDirty = true;
    },
    updateSectionProps(
      state,
      action: PayloadAction<{ id: string; props: Record<string, unknown> }>
    ) {
      if (!state.page) return;
      const section = state.page.sections.find((s) => s.id === action.payload.id);
      if (section) {
        section.props = action.payload.props as typeof section.props;
        state.isDirty = true;
      }
    },
    markClean(state) {
      state.isDirty = false;
    },
  },
});

export const {
  loadPage,
  updatePageTitle,
  addSection,
  removeSection,
  reorderSections,
  updateSectionProps,
  markClean,
} = draftPageSlice.actions;

export default draftPageSlice.reducer;
