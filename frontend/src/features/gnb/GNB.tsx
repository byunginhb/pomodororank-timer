import React, { useState, useEffect, useRef } from 'react';
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiVolume2,
  FiPause,
  FiPlay,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'EN' },
];

const SOUND_OPTIONS = [
  { label: 'NONE', value: '' },
  { label: 'CLOCK_TICKING', value: 'clock-ticking-sound.mp3' },
  { label: 'ROBOBIRDS_FX', value: 'robobirds-fx.mp3' },
];

const GNB: React.FC<{ mode: 'focus' | 'break' }> = ({ mode }) => {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState(SOUND_OPTIONS[0].value);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // localStorage에서 사운드 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('alarmSound');
    if (saved !== null && SOUND_OPTIONS.some((opt) => opt.value === saved)) {
      setSelectedSound(saved);
    }
  }, []);

  // 저장 버튼 클릭 시 localStorage에 저장
  const handleSaveSound = (value: string) => {
    setSelectedSound(value);
    localStorage.setItem('alarmSound', value);
    setSoundOpen(false);
  };

  // 미리듣기
  const handlePreview = (value: string) => {
    if (!previewAudioRef.current) return;

    if (isPlaying && playingSound === value) {
      // 현재 재생 중인 사운드를 정지
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      setIsPlaying(false);
      setPlayingSound(null);
    } else {
      // 새로운 사운드 재생
      if (isPlaying) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }
      previewAudioRef.current.src = `/sounds/${value}`;
      previewAudioRef.current.play();
      setIsPlaying(true);
      setPlayingSound(value);
    }
  };

  // 오디오 종료 시 상태 초기화
  useEffect(() => {
    const audio = previewAudioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setPlayingSound(null);
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleLangSelect = (code: string) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  // 사운드명 다국어 변환
  const getSoundLabel = (value: string) => {
    const found = SOUND_OPTIONS.find((opt) => opt.value === value);
    return found ? t(found.label) : '';
  };

  return (
    <nav
      className={`w-full h-16 flex items-center justify-between px-4 shadow-md fixed top-0 left-0 z-50 transition-colors duration-300 ${
        mode === 'focus' ? 'bg-blue-900' : 'bg-emerald-800'
      }`}>
      {/* 로고 */}
      <div className='flex items-center h-full'>
        <div className='p-2 h-16 flex items-center'>
          <img
            src='/logo.png'
            alt='logo'
            className='h-16 w-auto mr-2'
            style={{ minWidth: 64 }}
          />
        </div>
      </div>
      {/* PC 메뉴 */}
      <div className='hidden md:flex items-center space-x-4'>
        {/* 사운드 설정 드롭다운 */}
        <div className='relative'>
          <button
            onClick={() => setSoundOpen((v) => !v)}
            className='flex items-center px-3 py-1 rounded hover:bg-zinc-800 transition text-sm font-medium text-white focus:outline-none'
            aria-haspopup='true'>
            <FiVolume2 className='mr-1' />
            <span className='mx-2 text-zinc-400 text-sm truncate max-w-[70px]'>
              {getSoundLabel(selectedSound)}
            </span>
            <FiChevronDown className='ml-1' />
          </button>
          {soundOpen && (
            <div className='absolute right-0 mt-2 w-56 bg-zinc-800 rounded shadow-lg py-1 z-50 animate-fadeIn'>
              {SOUND_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  className='flex w-56 items-center justify-between px-4 py-2 text-sm text-white hover:bg-zinc-700 transition'>
                  <button
                    className={`flex-1 text-left ${
                      selectedSound === opt.value
                        ? 'font-bold text-blue-400'
                        : ''
                    }`}
                    onClick={() => handleSaveSound(opt.value)}>
                    {t(opt.label)}
                  </button>
                  {opt.value && (
                    <button
                      onClick={() => handlePreview(opt.value)}
                      className='ml-2 p-1 text-zinc-400 hover:text-white transition flex items-center gap-1'>
                      {isPlaying && playingSound === opt.value ? (
                        <>
                          <FiPause size={14} />
                          <span className='text-xs'>{t('STOP')}</span>
                        </>
                      ) : (
                        <>
                          <FiPlay size={14} />
                          <span className='text-xs'>{t('PLAY')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 언어 드롭다운 */}
        <div className='relative ml-2'>
          <button
            className='flex items-center px-3 py-1 rounded hover:bg-zinc-800 transition text-sm font-medium text-white focus:outline-none'
            onClick={() => setLangOpen((v) => !v)}>
            {LANGUAGES.find((l) => l.code === i18n.language)?.label}
            <FiChevronDown className='ml-1' />
          </button>
          {langOpen && (
            <div className='absolute right-0 mt-2 w-28 bg-zinc-800 rounded shadow-lg py-1 z-50 animate-fadeIn'>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className={`block w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 transition ${
                    i18n.language === lang.code ? 'font-bold text-blue-400' : ''
                  }`}
                  onClick={() => handleLangSelect(lang.code)}>
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* 로그인 버튼 */}
        <button className='ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-semibold text-sm shadow'>
          {t('LOGIN')}
        </button>
      </div>
      {/* 모바일 메뉴 버튼 */}
      <div className='md:hidden flex items-center'>
        <button
          className='text-white text-2xl focus:outline-none'
          onClick={() => setMobileMenuOpen((v) => !v)}>
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
      {/* 모바일 메뉴 드로어 */}
      {mobileMenuOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end md:hidden animate-fadeIn'>
          <div className='w-2/3 max-w-xs h-full p-6 flex flex-col space-y-6 shadow-lg'>
            <div className='flex justify-between items-center mb-4'>
              <div className='w-32 h-16 flex items-center'>
                <img
                  src='/logo.png'
                  alt='logo'
                  className='h-16 w-auto mr-2'
                  style={{ minWidth: 64 }}
                />
              </div>
              <button
                className='text-white text-2xl'
                onClick={() => setMobileMenuOpen(false)}>
                <FiX />
              </button>
            </div>
            {/* 사운드 설정 */}
            <div>
              <div className='text-xs text-zinc-400 mb-1'>
                {t('SOUND_SETTINGS')}
              </div>
              <div className='space-y-2'>
                {SOUND_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    className='flex items-center justify-between px-3 py-2 rounded bg-zinc-800'>
                    <button
                      className={`flex-1 text-left text-sm ${
                        selectedSound === opt.value
                          ? 'text-blue-400 font-bold'
                          : 'text-white'
                      }`}
                      onClick={() => handleSaveSound(opt.value)}>
                      {t(opt.label)}
                    </button>
                    {opt.value && (
                      <button
                        onClick={() => handlePreview(opt.value)}
                        className='ml-2 p-1 text-zinc-400 hover:text-white transition flex items-center gap-1'>
                        {isPlaying && playingSound === opt.value ? (
                          <>
                            <FiPause size={14} />
                            <span className='text-xs'>{t('PAUSE')}</span>
                          </>
                        ) : (
                          <>
                            <FiPlay size={14} />
                            <span className='text-xs'>{t('PLAY')}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* 언어 선택 */}
            <div>
              <div className='text-xs text-zinc-400 mb-1'>{t('LANGUAGE')}</div>
              <div className='flex space-x-2'>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      i18n.language === lang.code
                        ? 'bg-blue-500 text-white'
                        : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                    }`}
                    onClick={() => handleLangSelect(lang.code)}>
                    {lang.code === 'ko' ? t('KOREAN') : t('ENGLISH')}
                  </button>
                ))}
              </div>
            </div>
            {/* 로그인 버튼 */}
            <button className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-semibold text-sm shadow w-full'>
              {t('LOGIN')}
            </button>
          </div>
        </div>
      )}
      <audio ref={previewAudioRef} preload='auto' />
    </nav>
  );
};

export default GNB;
