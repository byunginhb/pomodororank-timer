import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getAuth } from 'firebase/auth';
import { db } from '../../constants/constants';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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
  loadStats: (uid: string) => Promise<void>;
}

const _loadStats = async (uid: string): Promise<TimerStats> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data().timerStats) {
      return userSnap.data().timerStats;
    }
  } catch {}
  return {
    totalFocusTime: 0,
    totalBreakTime: 0,
    completedSessions: 0,
    lastSessionDate: null,
    sessions: [],
  };
};

const saveStats = async (uid: string, stats: TimerStats) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { timerStats: stats });
  } catch {}
};

export const useTimerStore = create(
  devtools<TimerState>((set, get) => ({
    duration: 25,
    minutes: 25,
    seconds: 0,
    isRunning: false,
    stats: {
      totalFocusTime: 0,
      totalBreakTime: 0,
      completedSessions: 0,
      lastSessionDate: null,
      sessions: [],
    },

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

    completeSession: async (mode) => {
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
        sessions: [session, ...stats.sessions].slice(0, 50),
      };
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        await saveStats(user.uid, newStats);
      }
      set({ stats: newStats }, false, 'completeSession');
    },

    loadStats: async (uid: string) => {
      const stats = await _loadStats(uid);
      set({ stats }, false, 'loadStats');
    },
  }))
);
