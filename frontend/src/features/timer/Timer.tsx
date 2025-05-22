import { useEffect, useRef, useState } from 'react';
import { useTimerStore } from './useTimerStore';
import { FiPlay, FiPause, FiRotateCw } from 'react-icons/fi';
import styles from './Timer.module.css';
import SvgCircleTimer from './SvgCircleTimer';
import { useTranslation } from 'react-i18next';

const SOUND_OPTIONS = [
  {
    label: 'Clock Ticking',
    value: 'clock-ticking-sound.mp3',
  },
  {
    label: 'Robobirds FX',
    value: 'robobirds-fx.mp3',
  },
];

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

  const { t } = useTranslation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTimeRef = useRef<number>(minutes * 60 + seconds);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedSound, setSelectedSound] = useState(SOUND_OPTIONS[0].value);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  // GNB에서 저장한 사운드 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('alarmSound');
    if (saved && SOUND_OPTIONS.some((opt) => opt.value === saved)) {
      setSelectedSound(saved);
    }
  }, []);

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

  // 타이머 종료 시 효과음 재생
  useEffect(() => {
    const currentTime = minutes * 60 + seconds;
    if (prevTimeRef.current > 0 && currentTime === 0 && selectedSound) {
      audioRef.current?.play();
    }
    prevTimeRef.current = currentTime;
  }, [minutes, seconds, selectedSound]);

  // 알림 소리 재생 상태 관리
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => setIsAlarmPlaying(true);
    const handleEnded = () => setIsAlarmPlaying(false);
    const handlePause = () => setIsAlarmPlaying(false);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // 사운드 변경 시 오디오 src 변경
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [selectedSound]);

  // 알림끄기 버튼 핸들러
  const handleStopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsAlarmPlaying(false);
  };

  return (
    <div className={styles.background}>
      <audio ref={audioRef} src={`/sounds/${selectedSound}`} preload='auto' />
      {isAlarmPlaying && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 100 }}>
          <button
            onClick={handleStopAlarm}
            className='px-4 py-2 bg-red-500 text-white rounded shadow font-bold animate-pulse hover:bg-red-600 transition'>
            알림끄기
          </button>
        </div>
      )}
      <div className={styles.container}>
        {/* 프리셋 */}
        <div className={styles.presetGroup}>
          {[25, 50, 10, 5, 1].map((m) => (
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
              {t('PRESET_MIN', { min: m })}
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
              {t('START')}
            </button>
          ) : (
            <button onClick={pause} className={styles.pauseBtn}>
              <FiPause className='text-2xl' />
              {t('PAUSE')}
            </button>
          )}
          <button onClick={reset} className={styles.resetBtn}>
            <FiRotateCw className='text-2xl' />
            {t('RESET')}
          </button>
        </div>
      </div>
    </div>
  );
}
