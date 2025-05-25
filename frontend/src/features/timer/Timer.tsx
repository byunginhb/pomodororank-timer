import { useEffect, useRef, useState } from 'react';
import { useTimerStore } from './useTimerStore';

import SvgCircleTimer from './SvgCircleTimer';
import { useTranslation } from 'react-i18next';
import Statistics from './Statistics';
import ModeSelector from './ModeSelector';
import PresetSelector from './PresetSelector';
import TimerController from './TimerController';

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
      <div className='flex flex-col items-center gap-10 w-full max-w-2xl relative mt-20 lg:flex-row lg:items-start lg:max-w-4xl lg:gap-16 lg:mt-8'>
        {/* 타이머 컨텐츠 */}
        <div className='flex flex-col items-center gap-10 flex-1'>
          {/* 모드 선택 버튼 */}
          <ModeSelector mode={mode} setMode={setMode} t={t} />

          {/* 프리셋 */}
          <PresetSelector
            presets={presets}
            duration={duration}
            isRunning={isRunning}
            setDuration={setDuration}
            t={t}
          />

          {/* 원형 타이머 + 알림끄기 버튼 오버레이 */}
          <div className='relative flex items-center justify-center'>
            <SvgCircleTimer
              minutes={minutes}
              seconds={seconds}
              duration={duration}
              isRunning={isRunning}
              hideTime={isAlarmPlaying}
            />
            {isAlarmPlaying && (
              <button
                onClick={handleStopAlarm}
                className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 flex items-center justify-center rounded-full bg-red-400 text-white text-xl font-bold shadow-2xl animate-pulse hover:bg-red-500 transition z-20 border-2 border-white/100'
                style={{ minWidth: 120 }}>
                {t('STOP_ALARM')}
              </button>
            )}
          </div>

          {/* 버튼 */}
          <TimerController
            isRunning={isRunning}
            start={start}
            pause={pause}
            reset={reset}
            t={t}
          />
        </div>

        {/* 통계 표시 */}
        <Statistics stats={stats} t={t} />
      </div>
    </div>
  );
}
