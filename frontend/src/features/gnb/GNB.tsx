import React, { useState, useEffect, useRef } from 'react';
import { FiMenu, FiX, FiChevronDown, FiPlay, FiVolume2 } from 'react-icons/fi';
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

const GNB: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundModalOpen, setSoundModalOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState(SOUND_OPTIONS[0].value);
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // localStorage에서 사운드 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('alarmSound');
    if (saved !== null && SOUND_OPTIONS.some((opt) => opt.value === saved)) {
      setSelectedSound(saved);
    }
  }, []);

  // 저장 버튼 클릭 시 localStorage에 저장
  const handleSaveSound = () => {
    localStorage.setItem('alarmSound', selectedSound);
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 1200);
  };

  // 미리듣기
  const handlePreview = () => {
    if (selectedSound && previewAudioRef.current) {
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current.play();
    }
  };

  const handleLangSelect = (code: string) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  // 모달 닫기(ESC, 배경 클릭)
  useEffect(() => {
    if (!soundModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSoundModalOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [soundModalOpen]);

  // 사운드명 다국어 변환
  const getSoundLabel = (value: string) => {
    const found = SOUND_OPTIONS.find((opt) => opt.value === value);
    return found ? t(found.label) : '';
  };

  return (
    <nav className='w-full h-16 flex items-center justify-between px-4 bg-zinc-900 shadow-md fixed top-0 left-0 z-50'>
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
        {/* 사운드 설정 메뉴 */}
        <button
          onClick={() => setSoundModalOpen(true)}
          className='flex items-center px-3 py-1 rounded hover:bg-zinc-800 transition text-sm font-medium text-white focus:outline-none'
          aria-haspopup='true'>
          <FiVolume2 className='mr-1' />
          <span className='mx-2 text-zinc-400 text-sm truncate max-w-[70px]'>
            {getSoundLabel(selectedSound)}
          </span>
        </button>
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
          <div className='w-2/3 max-w-xs bg-zinc-900 h-full p-6 flex flex-col space-y-6 shadow-lg'>
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
            {/* 사운드 설정 메뉴 */}
            <button
              onClick={() => {
                setSoundModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className='flex items-center w-full px-3 py-2 rounded text-sm font-medium text-white hover:bg-zinc-800 transition shadow-none justify-between'>
              <span className='flex items-center'>
                <FiVolume2 className='mr-2' />
                {t('SOUND_SETTINGS')}
              </span>
              <span className='text-zinc-400 text-xs truncate max-w-[70px]'>
                {getSoundLabel(selectedSound)}
              </span>
            </button>
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
      {/* 사운드 설정 모달 */}
      {soundModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn'>
          <div className='bg-zinc-900 rounded-lg shadow-xl p-6 w-80 relative flex flex-col items-center'>
            <button
              className='absolute top-2 right-2 text-zinc-400 hover:text-white text-2xl'
              onClick={() => setSoundModalOpen(false)}
              aria-label='닫기'>
              <FiX />
            </button>
            <h2 className='text-lg font-bold text-white mb-4 flex items-center'>
              <FiVolume2 className='mr-2' />
              {t('ALARM_SOUND_SETTINGS')}
            </h2>
            <select
              value={selectedSound}
              onChange={(e) => setSelectedSound(e.target.value)}
              className='rounded px-2 py-2 text-base bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full mb-3'>
              {SOUND_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </option>
              ))}
            </select>
            <button
              type='button'
              onClick={handlePreview}
              disabled={!selectedSound}
              className={`w-full mb-3 px-3 py-2 rounded text-sm font-semibold shadow transition-colors duration-200 flex items-center justify-center ${
                selectedSound
                  ? 'bg-zinc-700 text-white hover:bg-blue-500'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
              title={t('PREVIEW')}>
              <FiPlay className='mr-1' /> {t('PREVIEW')}
              <audio
                ref={previewAudioRef}
                src={selectedSound ? `/sounds/${selectedSound}` : undefined}
                preload='auto'
              />
            </button>
            <button
              onClick={handleSaveSound}
              className={`w-full px-3 py-2 rounded text-base font-semibold shadow transition-colors duration-200 ${
                saveState === 'saved'
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}>
              {saveState === 'saved' ? t('SAVED') : t('SAVE')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default GNB;
