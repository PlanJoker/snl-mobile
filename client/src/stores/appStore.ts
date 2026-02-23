import { create } from "zustand";

export type TabId = "home" | "calendar" | "wam" | "gallery" | "admin";

interface AppStore {
  activeTab: TabId;
  isAdminMode: boolean;
  setActiveTab: (tab: TabId) => void;
  setAdminMode: (v: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: "home",
  isAdminMode: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setAdminMode: (v) => set({ isAdminMode: v }),
}));
