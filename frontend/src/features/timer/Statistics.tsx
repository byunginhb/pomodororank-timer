import React from 'react';

interface TimerSession {
  id: string;
  mode: 'focus' | 'break';
  duration: number;
  completedAt: string;
}

interface TimerStats {
  totalFocusTime: number;
  totalBreakTime: number;
  completedSessions: number;
  sessions: TimerSession[];
}

interface StatisticsProps {
  stats: TimerStats;
  t: (key: string, options?: any) => string;
}

const Statistics: React.FC<StatisticsProps> = ({ stats, t }) => {
  return (
    <div className='flex flex-col gap-6 mb-8 p-6 bg-white/10 rounded-xl backdrop-blur-lg border border-white/10 w-full lg:w-96 sticky top-8'>
      <div className='flex gap-8 pb-6 border-b border-white/10'>
        <div className='flex flex-col items-center gap-2'>
          <span className='text-sm text-white/60 font-medium'>
            {t('TOTAL_FOCUS_TIME')}
          </span>
          <span className='text-2xl font-bold text-white font-mono'>
            {Math.floor(stats.totalFocusTime)}
            {t('MINUTES_UNIT')}
          </span>
        </div>
        <div className='flex flex-col items-center gap-2'>
          <span className='text-sm text-white/60 font-medium'>
            {t('TOTAL_BREAK_TIME')}
          </span>
          <span className='text-2xl font-bold text-white font-mono'>
            {Math.floor(stats.totalBreakTime)}
            {t('MINUTES_UNIT')}
          </span>
        </div>
        <div className='flex flex-col items-center gap-2'>
          <span className='text-sm text-white/60 font-medium'>
            {t('COMPLETED_SESSIONS')}
          </span>
          <span className='text-2xl font-bold text-white font-mono'>
            {stats.completedSessions}
            {t('SESSIONS_UNIT')}
          </span>
        </div>
      </div>
      <div className='flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2'>
        {stats.sessions.map((session) => {
          const date = new Date(session.completedAt);
          const formattedDate = `${date.getFullYear()}.${String(
            date.getMonth() + 1
          ).padStart(2, '0')}.${String(date.getDate()).padStart(
            2,
            '0'
          )} ${String(date.getHours()).padStart(2, '0')}:${String(
            date.getMinutes()
          ).padStart(2, '0')}`;

          return (
            <div
              key={session.id}
              className='flex items-center gap-4 p-3 bg-white/5 rounded-lg text-sm'>
              <span
                className={`py-1 px-3 rounded-full font-semibold text-xs ${
                  session.mode === 'focus'
                    ? 'bg-blue-900/20 text-blue-400'
                    : 'bg-emerald-800/20 text-emerald-400'
                }`}>
                {t(session.mode === 'focus' ? 'FOCUS' : 'BREAK')}
              </span>
              <span className='font-mono text-white/80'>
                {Math.floor(session.duration)}분
              </span>
              <span className='ml-auto text-white/50 text-xs'>
                {formattedDate}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Statistics;
