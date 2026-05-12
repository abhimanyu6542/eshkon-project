import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PanelView = "sections" | "props" | "preview";

interface UiState {
  selectedSectionId: string | null;
  activePanel: PanelView;
  isSidebarOpen: boolean;
  toastMessage: string | null;
  toastType: "success" | "error" | "info" | null;
}

const initialState: UiState = {
  selectedSectionId: null,
  activePanel: "sections",
  isSidebarOpen: true,
  toastMessage: null,
  toastType: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    selectSection(state, action: PayloadAction<string | null>) {
      state.selectedSectionId = action.payload;
      if (action.payload) state.activePanel = "props";
    },
    setActivePanel(state, action: PayloadAction<PanelView>) {
      state.activePanel = action.payload;
    },
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    showToast(
      state,
      action: PayloadAction<{ message: string; type: "success" | "error" | "info" }>
    ) {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type;
    },
    clearToast(state) {
      state.toastMessage = null;
      state.toastType = null;
    },
  },
});

export const { selectSection, setActivePanel, toggleSidebar, showToast, clearToast } =
  uiSlice.actions;

export default uiSlice.reducer;
