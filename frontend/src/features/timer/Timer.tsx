import { useEffect, useRef, useState } from 'react';
import { useTimerStore } from './useTimerStore';
import { FiPlay, FiPause, FiRotateCw } from 'react-icons/fi';
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

  const focusPresets = [5, 10, 25, 50];
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
      className='min-h-screen flex items-center justify-center text-white px-2'
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
      <div className='flex flex-col items-center gap-10 w-full max-w-2xl relative mt-20 lg:flex-row lg:items-start lg:max-w-4xl lg:gap-16 lg:mt-8'>
        {/* 타이머 컨텐츠 */}
        <div className='flex flex-col items-center gap-10 flex-1'>
          {/* 모드 선택 버튼 */}
          <div className='flex gap-2 justify-center mb-4'>
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMode(opt.key as 'focus' | 'break')}
                className={`py-2 px-6 rounded-full font-bold text-base border-2 transition-all duration-200 cursor-pointer ${
                  mode === opt.key
                    ? 'border-white bg-white text-zinc-900 shadow-lg'
                    : 'border-transparent bg-white/10 text-white'
                }`}
                style={{
                  boxShadow:
                    mode === opt.key
                      ? '0 2px 8px 0 rgba(0,0,0,0.12)'
                      : undefined,
                }}
                aria-pressed={mode === opt.key}>
                {t(opt.label)}
              </button>
            ))}
          </div>

          {/* 프리셋 */}
          <div className='flex gap-3 mb-2'>
            {presets.map((m) => (
              <button
                key={m}
                disabled={isRunning}
                onClick={() => setDuration(m)}
                className={`py-2 px-5 rounded-full text-base font-semibold transition-all shadow border border-white/10 backdrop-blur-sm ${
                  duration === m
                    ? 'bg-white text-zinc-900 shadow-lg scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}>
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
          <div className='flex gap-5 mt-2 justify-center'>
            {!isRunning ? (
              <button
                onClick={start}
                className='flex items-center gap-2 py-4 px-8 bg-cyan-500 text-white rounded-xl text-lg font-bold shadow-lg transition-all border-none outline-none hover:bg-cyan-300'>
                <FiPlay className='text-2xl' />
                {t('START')}
              </button>
            ) : (
              <button
                onClick={pause}
                className='flex items-center gap-2 py-4 px-8 bg-yellow-300 text-zinc-900 rounded-xl text-lg font-bold shadow-lg transition-all border-none outline-none hover:bg-yellow-200'>
                <FiPause className='text-2xl' />
                {t('PAUSE')}
              </button>
            )}
            <button
              onClick={reset}
              className='flex items-center gap-2 py-4 px-8 bg-white/10 text-white rounded-xl text-lg font-bold shadow-lg transition-all border-none outline-none hover:bg-white/20'>
              <FiRotateCw className='text-2xl' />
              {t('RESET')}
            </button>
          </div>
        </div>

        {/* 통계 표시 */}
        <div className='flex flex-col gap-6 mb-8 p-6 bg-white/10 rounded-xl backdrop-blur-lg border border-white/10 w-full lg:w-96 sticky top-8'>
          <div className='flex gap-8 pb-6 border-b border-white/10'>
            <div className='flex flex-col items-center gap-2'>
              <span className='text-sm text-white/60 font-medium'>
                {t('TOTAL_FOCUS_TIME')}
              </span>
              <span className='text-2xl font-bold text-white font-mono'>
                {stats.totalFocusTime}
                {t('MINUTES')}
              </span>
            </div>
            <div className='flex flex-col items-center gap-2'>
              <span className='text-sm text-white/60 font-medium'>
                {t('TOTAL_BREAK_TIME')}
              </span>
              <span className='text-2xl font-bold text-white font-mono'>
                {stats.totalBreakTime}
                {t('MINUTES')}
              </span>
            </div>
            <div className='flex flex-col items-center gap-2'>
              <span className='text-sm text-white/60 font-medium'>
                {t('COMPLETED_SESSIONS')}
              </span>
              <span className='text-2xl font-bold text-white font-mono'>
                {stats.completedSessions}
                {t('SESSIONS')}
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
                    {session.duration}
                    {t('MINUTES')}
                  </span>
                  <span className='ml-auto text-white/50 text-xs'>
                    {formattedDate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
