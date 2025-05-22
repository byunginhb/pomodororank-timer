import { useEffect, useRef } from 'react';
import { useTimerStore } from './useTimerStore';
import { FiPlay, FiPause, FiRotateCw } from 'react-icons/fi';
import styles from './Timer.module.css';
import SvgCircleTimer from './SvgCircleTimer';

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

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        {/* 프리셋 */}
        <div className={styles.presetGroup}>
          {[25, 50, 10, 5].map((m) => (
            <button
              key={m}
              disabled={isRunning}
              onClick={() => setDuration(m)}
              className={[
                styles.presetBtn,
                duration === m
                  ? styles.presetBtnActive
                  : styles.presetBtnInactive,
                isRunning ? styles.disabled : '',
              ].join(' ')}>
              {m}분
            </button>
          ))}
        </div>

        {/* 원형 타이머 */}
        <SvgCircleTimer
          minutes={minutes}
          seconds={seconds}
          duration={duration}
          isRunning={isRunning}
        />

        {/* 버튼 */}
        <div className={styles.buttonGroup}>
          {!isRunning ? (
            <button onClick={start} className={styles.startBtn}>
              <FiPlay className='text-2xl' />
              시작
            </button>
          ) : (
            <button onClick={pause} className={styles.pauseBtn}>
              <FiPause className='text-2xl' />
              일시정지
            </button>
          )}
          <button onClick={reset} className={styles.resetBtn}>
            <FiRotateCw className='text-2xl' />
            리셋
          </button>
        </div>
      </div>
    </div>
  );
}
