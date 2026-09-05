import { create } from 'zustand';

interface StudentState {
  xp: number;
  level: number;
  streak: number;
  lessonsCompleted: number;
  weeklyGoal: { current: number; target: number };
  addXP: (amount: number) => void;
  incrementLessons: () => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  xp: 1250,
  level: 5,
  streak: 15,
  lessonsCompleted: 24,
  weeklyGoal: { current: 3, target: 5 },
  addXP: (amount) => set((state) => {
    const newXp = state.xp + amount;
    const newLevel = Math.floor(newXp / 500) + 1;
    return { xp: newXp, level: newLevel };
  }),
  incrementLessons: () => set((state) => ({
    lessonsCompleted: state.lessonsCompleted + 1,
    weeklyGoal: { ...state.weeklyGoal, current: Math.min(state.weeklyGoal.current + 1, state.weeklyGoal.target) }
  })),
}));
