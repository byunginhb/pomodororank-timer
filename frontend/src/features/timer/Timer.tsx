import { useEffect, useRef } from 'react';
import { useTimerStore } from './useTimerStore';
import { FiPlay, FiPause, FiRotateCw } from 'react-icons/fi';

const CIRCLE_RADIUS = 150;
const STROKE_WIDTH = 12;
const GLOW_MARGIN = 32; // Glow 효과 여유분
const SVG_SIZE = (CIRCLE_RADIUS + STROKE_WIDTH) * 2 + GLOW_MARGIN * 2; // 324 + 64 = 388
const CENTER = SVG_SIZE / 2; // 194
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function Timer() {
  const {
    minutes,
    seconds,
    duration,
    isRunning,
    setDuration,
    start,
    pause,
    reset,
    tick,
  } = useTimerStore();

  const totalSeconds = duration * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const progress = (remainingSeconds / totalSeconds) * CIRCLE_CIRCUMFERENCE;
  const percent = remainingSeconds / totalSeconds;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => tick(), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  const padded = (n: number) => String(n).padStart(2, '0');

  // 진행률에 따라 색상 변화
  const getProgressColor = () => {
    if (percent > 0.5) return '#38bdf8'; // 파랑
    if (percent > 0.2) return '#facc15'; // 노랑
    return '#ef4444'; // 빨강
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#18181b] flex items-center justify-center text-white px-2'>
      <div className='flex flex-col items-center gap-10 w-full max-w-xl'>
        {/* 프리셋 */}
        <div className='flex gap-3 mb-2'>
          {[25, 50, 5].map((m) => (
            <button
              key={m}
              disabled={isRunning}
              onClick={() => setDuration(m)}
              className={`px-5 py-2 rounded-full text-base font-semibold transition shadow-lg border border-white/10 backdrop-blur-md
                ${
                  duration === m
                    ? 'bg-white text-gray-900 shadow-xl scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                }
                ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}
              `}>
              {m}분
            </button>
          ))}
        </div>

        {/* 원형 타이머 */}
        <div
          className='relative flex items-center justify-center'
          style={{ width: SVG_SIZE, height: SVG_SIZE }}>
          <svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            style={{ display: 'block' }}
            className='transform -rotate-90'>
            {/* 배경 원 */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={CIRCLE_RADIUS}
              stroke='#23272f'
              strokeWidth={STROKE_WIDTH}
              fill='none'
            />
            {/* 진행 원 */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={CIRCLE_RADIUS}
              stroke={getProgressColor()}
              strokeWidth={STROKE_WIDTH}
              fill='none'
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={CIRCLE_CIRCUMFERENCE - progress}
              strokeLinecap='round'
              style={{
                transition: 'stroke-dashoffset 1s linear, stroke 0.5s',
                filter: `drop-shadow(0 0 16px ${getProgressColor()}80)`,
              }}
            />
          </svg>
          {/* 중앙 시간 표시 */}
          <div className='absolute inset-0 flex flex-col items-center justify-center select-none'>
            <span className='text-[3rem] font-mono font-extrabold tracking-widest drop-shadow-lg'>
              {padded(minutes)}:{padded(seconds)}
            </span>
            <span className='mt-2 text-base text-white/60 font-medium tracking-wide'>
              {duration}분 타이머
            </span>
          </div>
        </div>

        {/* 버튼 */}
        <div className='flex gap-5 mt-2'>
          {!isRunning ? (
            <button
              onClick={start}
              className='flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl text-lg font-bold shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-300'>
              <FiPlay className='text-2xl' />
              시작
            </button>
          ) : (
            <button
              onClick={pause}
              className='flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-2xl text-lg font-bold shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-200'>
              <FiPause className='text-2xl' />
              일시정지
            </button>
          )}
          <button
            onClick={reset}
            className='flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-lg font-bold shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30'>
            <FiRotateCw className='text-2xl' />
            리셋
          </button>
        </div>
      </div>
    </div>
  );
}
