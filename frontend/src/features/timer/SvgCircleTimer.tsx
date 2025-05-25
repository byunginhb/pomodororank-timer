import React from 'react';
import { useTranslation } from 'react-i18next';

interface SvgCircleTimerProps {
  minutes: number;
  seconds: number;
  duration: number;
  isRunning: boolean;
  hideTime?: boolean;
}

const CIRCLE_RADIUS = 150;
const STROKE_WIDTH = 12;
const GLOW_MARGIN = 32;
const SVG_SIZE = (CIRCLE_RADIUS + STROKE_WIDTH) * 2 + GLOW_MARGIN * 2;
const CENTER = SVG_SIZE / 2;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

function padded(n: number) {
  return String(n).padStart(2, '0');
}

function getProgressColor(percent: number) {
  if (percent > 0.5) return '#38bdf8';
  if (percent > 0.2) return '#facc15';
  return '#ef4444';
}

const SvgCircleTimer: React.FC<SvgCircleTimerProps> = ({
  minutes,
  seconds,
  duration,
  hideTime = false,
}) => {
  const { t } = useTranslation();
  const totalSeconds = duration * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const percent = remainingSeconds / totalSeconds;
  const progress = percent * CIRCLE_CIRCUMFERENCE;
  const color = getProgressColor(percent);

  return (
    <div
      className='relative flex items-center justify-center'
      style={{ width: SVG_SIZE, height: SVG_SIZE }}>
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className='block -rotate-90'>
        <circle
          cx={CENTER}
          cy={CENTER}
          r={CIRCLE_RADIUS}
          stroke='#23272f'
          strokeWidth={STROKE_WIDTH}
          fill='none'
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={CIRCLE_RADIUS}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill='none'
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          strokeDashoffset={CIRCLE_CIRCUMFERENCE - progress}
          strokeLinecap='round'
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.5s',
            filter: `drop-shadow(0 0 16px ${color}80)`,
          }}
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center select-none'>
        {!hideTime && (
          <>
            <span className='text-5xl font-mono font-extrabold tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]'>
              {padded(minutes)}:{padded(seconds)}
            </span>
            <span className='mt-2 text-base text-white/60 font-medium tracking-wide'>
              {t('TIMER_LABEL', { min: duration })}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default SvgCircleTimer;
