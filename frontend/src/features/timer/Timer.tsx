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

const MODE_OPTIONS = [
  { key: 'focus', label: 'FOCUS', bg: '#1e40af' }, // blue-900
  { key: 'break', label: 'BREAK', bg: '#065f46' }, // emerald-800
];

export default function Timer({
  mode,
  setMode,
}: {
  mode: 'focus' | 'break';
  setMode: (m: 'focus' | 'break') => void;
}) {
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
    stats,
    completeSession,
  } = useTimerStore();

  const { t } = useTranslation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTimeRef = useRef<number>(minutes * 60 + seconds);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedSound, setSelectedSound] = useState(SOUND_OPTIONS[0].value);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  const focusPresets = [0.5, 5, 10, 25, 50];
  const breakPresets = [5, 10, 20];
  const presets = mode === 'focus' ? focusPresets : breakPresets;

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

  // 타이머 종료 시 효과음 재생 및 통계 업데이트
  useEffect(() => {
    const currentTime = minutes * 60 + seconds;
    if (prevTimeRef.current > 0 && currentTime === 0 && selectedSound) {
      audioRef.current?.play();
      completeSession(mode);
    }
    prevTimeRef.current = currentTime;
  }, [minutes, seconds, selectedSound, mode, completeSession]);

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
    <div
      className={styles.background}
      style={{
        background:
          mode === 'focus'
            ? 'linear-gradient(135deg, #1e293b 0%, #1e40af 60%, #1e293b 100%)'
            : 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #064e3b 100%)',
        transition: 'background 0.5s',
      }}>
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
        {/* 타이머 컨텐츠 */}
        <div className={styles.timerContent}>
          {/* 모드 선택 버튼 */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              marginBottom: 16,
            }}>
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMode(opt.key as 'focus' | 'break')}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: 9999,
                  fontWeight: 700,
                  fontSize: 16,
                  border:
                    mode === opt.key
                      ? '2px solid #fff'
                      : '2px solid transparent',
                  background:
                    mode === opt.key ? '#fff' : 'rgba(255,255,255,0.08)',
                  color: mode === opt.key ? '#18181b' : '#fff',
                  boxShadow:
                    mode === opt.key
                      ? '0 2px 8px 0 rgba(0,0,0,0.12)'
                      : undefined,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                aria-pressed={mode === opt.key}>
                {t(opt.label)}
              </button>
            ))}
          </div>

          {/* 프리셋 */}
          <div className={styles.presetGroup}>
            {presets.map((m) => (
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

        {/* 통계 표시 */}
        <div className={styles.statsContainer}>
          <div className={styles.statsSummary}>
            <div className={styles.statsItem}>
              <span className={styles.statsLabel}>{t('TOTAL_FOCUS_TIME')}</span>
              <span className={styles.statsValue}>
                {stats.totalFocusTime}분
              </span>
            </div>
            <div className={styles.statsItem}>
              <span className={styles.statsLabel}>{t('TOTAL_BREAK_TIME')}</span>
              <span className={styles.statsValue}>
                {stats.totalBreakTime}분
              </span>
            </div>
            <div className={styles.statsItem}>
              <span className={styles.statsLabel}>
                {t('COMPLETED_SESSIONS')}
              </span>
              <span className={styles.statsValue}>
                {stats.completedSessions}회
              </span>
            </div>
          </div>

          <div className={styles.sessionList}>
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
                <div key={session.id} className={styles.sessionItem}>
                  <span
                    className={`${styles.sessionMode} ${
                      styles[
                        `sessionMode${
                          session.mode === 'focus' ? 'Focus' : 'Break'
                        }`
                      ]
                    }`}>
                    {t(session.mode === 'focus' ? 'FOCUS' : 'BREAK')}
                  </span>
                  <span className={styles.sessionDuration}>
                    {session.duration}분
                  </span>
                  <span className={styles.sessionDate}>{formattedDate}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
