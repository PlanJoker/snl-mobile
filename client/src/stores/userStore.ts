import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  university: string;
  major: string;
  joinedAt: string;
}

export interface StudyGoal {
  id: string;
  semesterId: string;
  semesterName: string;
  targetWAM: number;
  targetGrade: string;
  note: string;
}

export interface UserPhoto {
  id: string;
  userId: string;
  src: string;
  caption: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  submitted: boolean;
}

interface UserState {
  users: UserProfile[];
  currentUserId: string | null;
  studyGoals: Record<string, StudyGoal[]>;
  userPhotos: UserPhoto[];
  register: (profile: Omit<UserProfile, "id" | "joinedAt"> & { password: string }) => { success: boolean; error?: string };
  loginUser: (username: string, password: string) => { success: boolean; isAdmin?: boolean; error?: string };
  logoutUser: () => void;
  getCurrentUser: () => UserProfile | null;
  addGoal: (goal: Omit<StudyGoal, "id">) => void;
  updateGoal: (goalId: string, updates: Partial<StudyGoal>) => void;
  removeGoal: (goalId: string) => void;
  getGoals: () => StudyGoal[];
  addUserPhoto: (photo: Omit<UserPhoto, "id" | "uploadedAt" | "status" | "submitted">) => string;
  markPhotoSubmitted: (photoId: string) => void;
  removeUserPhoto: (photoId: string) => void;
  getUserPhotos: () => UserPhoto[];
  updatePhotoStatus: (photoId: string, status: UserPhoto["status"]) => void;
}

let _passwords: Record<string, string> = {};
const uid = () => Math.random().toString(36).slice(2, 10);

const TESTER_ID = "snl_tester01_seed";
const TESTER_PW = "tester01!";
const TESTER_PROFILE: UserProfile = {
  id: TESTER_ID,
  username: "snl_tester01",
  email: "tester01@snl.com",
  displayName: "John Smith",
  university: "Monash University",
  major: "Computer Science",
  joinedAt: "2025-01-01T00:00:00.000Z",
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [TESTER_PROFILE],
      currentUserId: null,
      studyGoals: { [TESTER_ID]: [] },
      userPhotos: [],

      register: ({ password, ...profile }) => {
        const state = get();
        if (state.users.some((u) => u.username === profile.username)) {
          return { success: false, error: "Username already taken." };
        }
        const id = uid();
        const newUser: UserProfile = { ...profile, id, joinedAt: new Date().toISOString() };
        _passwords[id] = password;
        set((s) => ({ users: [...s.users, newUser], currentUserId: id }));
        return { success: true };
      },

      loginUser: (username, password) => {
        if (username === "snl_admin" && password === "admin123!") {
          return { success: true, isAdmin: true };
        }
        const state = get();
        const user = state.users.find((u) => u.username === username);
        if (!user) return { success: false, error: "User not found." };
        if (username === "snl_tester01") {
          if (password !== TESTER_PW) return { success: false, error: "Wrong password." };
          _passwords[TESTER_ID] = TESTER_PW;
        }
        if (_passwords[user.id] !== password) return { success: false, error: "Wrong password." };
        set({ currentUserId: user.id });
        return { success: true };
      },

      logoutUser: () => set({ currentUserId: null }),

      getCurrentUser: () => {
        const { users, currentUserId } = get();
        if (!currentUserId) return null;
        return users.find((u) => u.id === currentUserId) ?? null;
      },

      addGoal: (goal) => {
        const { currentUserId, studyGoals } = get();
        if (!currentUserId) return;
        const id = uid();
        const userGoals = studyGoals[currentUserId] ?? [];
        set({ studyGoals: { ...studyGoals, [currentUserId]: [...userGoals, { ...goal, id }] } });
      },

      updateGoal: (goalId, updates) => {
        const { currentUserId, studyGoals } = get();
        if (!currentUserId) return;
        const userGoals = studyGoals[currentUserId] ?? [];
        set({
          studyGoals: {
            ...studyGoals,
            [currentUserId]: userGoals.map((g) => (g.id === goalId ? { ...g, ...updates } : g)),
          },
        });
      },

      removeGoal: (goalId) => {
        const { currentUserId, studyGoals } = get();
        if (!currentUserId) return;
        const userGoals = studyGoals[currentUserId] ?? [];
        set({ studyGoals: { ...studyGoals, [currentUserId]: userGoals.filter((g) => g.id !== goalId) } });
      },

      getGoals: () => {
        const { currentUserId, studyGoals } = get();
        if (!currentUserId) return [];
        return studyGoals[currentUserId] ?? [];
      },

      addUserPhoto: (photo) => {
        const id = uid();
        const newPhoto: UserPhoto = {
          ...photo,
          id,
          uploadedAt: new Date().toISOString(),
          status: "pending",
          submitted: false,
        };
        set((s) => ({ userPhotos: [...s.userPhotos, newPhoto] }));
        return id;
      },

      markPhotoSubmitted: (photoId) => {
        set((s) => ({
          userPhotos: s.userPhotos.map((p) => p.id === photoId ? { ...p, submitted: true } : p),
        }));
      },

      removeUserPhoto: (photoId) => {
        set((s) => ({ userPhotos: s.userPhotos.filter((p) => p.id !== photoId) }));
      },

      getUserPhotos: () => {
        const { currentUserId, userPhotos } = get();
        if (!currentUserId) return [];
        return userPhotos.filter((p) => p.userId === currentUserId);
      },

      updatePhotoStatus: (photoId, status) => {
        set((s) => ({
          userPhotos: s.userPhotos.map((p) => p.id === photoId ? { ...p, status } : p),
        }));
      },
    }),
    {
      name: "snl-mobile-users",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const hasTester = state.users.some((u) => u.username === "snl_tester01");
        if (!hasTester) {
          state.users = [TESTER_PROFILE, ...state.users];
          state.studyGoals = { [TESTER_ID]: [], ...state.studyGoals };
        }
        _passwords[TESTER_ID] = TESTER_PW;
      },
    },
  ),
);
