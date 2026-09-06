import { create } from "zustand";
import { useAuthStore } from "./authStore";

interface StudentState {
  xp: number;
  level: number;
  streak: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
  lessonsCompleted: number;
  badgesCount: number;
  accuracyRate: number | null;
  grade: number;
  weeklyGoal: { current: number; target: number };
  isLoading: boolean;
  addXP: (
    amount: number,
    meta?: { action?: string; sourceType?: string; sourceId?: string },
  ) => Promise<void>;
  incrementLessons: () => void;
  completeLesson: (lessonId: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  xp: 0,
  level: 1,
  streak: 0,
  currentLevelXp: 0,
  nextLevelXp: 100,
  progress: 0,
  lessonsCompleted: 0,
  badgesCount: 0,
  accuracyRate: null,
  grade: 10,
  weeklyGoal: { current: 0, target: 5 },
  isLoading: false,

  addXP: async (amount, meta) => {
    // Optimistic update first
    set((state) => ({ xp: state.xp + amount }));

    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const res = await fetch("/api/gamification/award-xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          action: meta?.action || "LEARNING",
          sourceType: meta?.sourceType || "GENERAL",
          sourceId: meta?.sourceId || "",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        set({
          xp: data.xp,
          level: data.level,
          streak: data.streak,
          currentLevelXp: data.currentLevelXp,
          nextLevelXp: data.nextLevelXp,
          progress: data.progress,
          lessonsCompleted: data.lessonsCompleted || 0,
          badgesCount: data.badgesCount || 0,
          accuracyRate: data.accuracyRate ?? null,
          grade: data.grade || 10,
        });
      }
    } catch (err) {
      console.error("Failed to sync XP with server:", err);
    }
  },

  completeLesson: async (lessonId: string) => {
    // Optimistic update
    set((state) => ({
      lessonsCompleted: state.lessonsCompleted + 1,
      weeklyGoal: {
        ...state.weeklyGoal,
        current: Math.min(state.weeklyGoal.current + 1, state.weeklyGoal.target),
      },
    }));

    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const res = await fetch("/api/gamification/complete-lesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonId }),
      });
      if (res.ok) {
        const data = await res.json();
        set({
          xp: data.xp,
          level: data.level,
          streak: data.streak,
          currentLevelXp: data.currentLevelXp,
          nextLevelXp: data.nextLevelXp,
          progress: data.progress,
          lessonsCompleted: data.lessonsCompleted || 0,
          badgesCount: data.badgesCount || 0,
          accuracyRate: data.accuracyRate ?? null,
          grade: data.grade || 10,
        });
      }
    } catch (err) {
      console.error("Failed to complete lesson on server:", err);
    }
  },

  incrementLessons: () => {
    set((state) => ({
      lessonsCompleted: state.lessonsCompleted + 1,
      weeklyGoal: {
        ...state.weeklyGoal,
        current: Math.min(state.weeklyGoal.current + 1, state.weeklyGoal.target),
      },
    }));
  },

  fetchProfile: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true });
    try {
      const res = await fetch("/api/gamification/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        set({
          xp: data.xp,
          level: data.level,
          streak: data.streak,
          currentLevelXp: data.currentLevelXp,
          nextLevelXp: data.nextLevelXp,
          progress: data.progress,
          lessonsCompleted: data.lessonsCompleted || 0,
          badgesCount: data.badgesCount || 0,
          accuracyRate: data.accuracyRate ?? null,
          grade: data.grade || 10,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch student profile", error);
      set({ isLoading: false });
    }
  },
}));
