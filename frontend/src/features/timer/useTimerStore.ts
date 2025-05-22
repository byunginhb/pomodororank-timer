import { create } from 'zustand';

interface TimerState {
  duration: number; // 분 단위
  minutes: number;
  seconds: number;
  isRunning: boolean;
  setDuration: (minutes: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  duration: 25,
  minutes: 25,
  seconds: 0,
  isRunning: false,

  setDuration: (minutes) =>
    set({
      duration: minutes,
      minutes,
      seconds: 0,
      isRunning: false,
    }),

  start: () => {
    if (get().isRunning) return;
    set({ isRunning: true });
  },

  pause: () => set({ isRunning: false }),

  reset: () => {
    const duration = get().duration;
    set({
      minutes: duration,
      seconds: 0,
      isRunning: false,
    });
  },

  tick: () => {
    const { isRunning, minutes, seconds } = get();
    if (!isRunning) return;

    const totalSeconds = minutes * 60 + seconds - 1;
    if (totalSeconds < 0) {
      set({ isRunning: false });
      return;
    }

    set({
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60,
    });
  },
}));
