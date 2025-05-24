import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface TimerSession {
  id: string;
  mode: 'focus' | 'break';
  duration: number;
  completedAt: string;
}

interface TimerStats {
  totalFocusTime: number; // 분 단위
  totalBreakTime: number; // 분 단위
  completedSessions: number;
  lastSessionDate: string | null;
  sessions: TimerSession[];
}

interface TimerState {
  duration: number; // 분 단위
  minutes: number;
  seconds: number;
  isRunning: boolean;
  stats: TimerStats;
  setDuration: (minutes: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  completeSession: (mode: 'focus' | 'break') => void;
}

const loadStats = (): TimerStats => {
  const saved = localStorage.getItem('timerStats');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    totalFocusTime: 0,
    totalBreakTime: 0,
    completedSessions: 0,
    lastSessionDate: null,
    sessions: [],
  };
};

export const useTimerStore = create(
  devtools<TimerState>((set, get) => ({
    duration: 25,
    minutes: 25,
    seconds: 0,
    isRunning: false,
    stats: loadStats(),

    setDuration: (minutes) =>
      set(
        {
          duration: minutes,
          minutes,
          seconds: 0,
          isRunning: false,
        },
        false,
        'setDuration'
      ),

    start: () => {
      if (get().isRunning) return;
      set({ isRunning: true }, false, 'start');
    },

    pause: () => set({ isRunning: false }, false, 'pause'),

    reset: () => {
      const duration = get().duration;
      set(
        {
          minutes: duration,
          seconds: 0,
          isRunning: false,
        },
        false,
        'reset'
      );
    },

    tick: () => {
      const { isRunning, minutes, seconds } = get();
      if (!isRunning) return;

      const totalSeconds = minutes * 60 + seconds - 1;
      if (totalSeconds < 0) {
        set({ isRunning: false }, false, 'tick');
        return;
      }

      set(
        {
          minutes: Math.floor(totalSeconds / 60),
          seconds: totalSeconds % 60,
        },
        false,
        'tick'
      );
    },

    completeSession: (mode) => {
      const { stats, duration } = get();
      const now = new Date();
      const session: TimerSession = {
        id: now.toISOString(),
        mode,
        duration,
        completedAt: now.toISOString(),
      };

      const newStats = {
        ...stats,
        totalFocusTime:
          mode === 'focus'
            ? stats.totalFocusTime + duration
            : stats.totalFocusTime,
        totalBreakTime:
          mode === 'break'
            ? stats.totalBreakTime + duration
            : stats.totalBreakTime,
        completedSessions: stats.completedSessions + 1,
        lastSessionDate: now.toISOString(),
        sessions: [session, ...stats.sessions].slice(0, 50), // 최근 50개 세션만 유지
      };

      localStorage.setItem('timerStats', JSON.stringify(newStats));
      set({ stats: newStats }, false, 'completeSession');
    },
  }))
);
