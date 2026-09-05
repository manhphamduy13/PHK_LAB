import { create } from 'zustand';
import { useAuthStore } from './authStore';

interface StudentState {
  xp: number;
  level: number;
  streak: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
  lessonsCompleted: number;
  weeklyGoal: { current: number; target: number };
  isLoading: boolean;
  addXP: (amount: number) => void;
  incrementLessons: () => void;
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
  weeklyGoal: { current: 0, target: 5 },
  isLoading: false,
  
  addXP: (amount) => set((state) => {
    // Optimistic update
    const newXp = state.xp + amount;
    return { xp: newXp };
  }),
  
  incrementLessons: () => set((state) => ({
    lessonsCompleted: state.lessonsCompleted + 1,
    weeklyGoal: { ...state.weeklyGoal, current: Math.min(state.weeklyGoal.current + 1, state.weeklyGoal.target) }
  })),

  fetchProfile: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const res = await fetch('/api/gamification/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch student profile", error);
      set({ isLoading: false });
    }
  }
}));
