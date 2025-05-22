import React, { useState } from 'react';
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'EN' },
];

const GNB: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLangSelect = (code: string) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <nav className='w-full h-16 flex items-center justify-between px-4 bg-zinc-900 shadow-md fixed top-0 left-0 z-50'>
      {/* 로고 */}
      <div className='flex items-center h-full'>
        <div className='p-4 h-8 bg-zinc-800 rounded flex items-center justify-center text-white font-bold text-lg tracking-wide'>
          {t('LOGO')}
        </div>
      </div>
      {/* PC 메뉴 */}
      <div className='hidden md:flex items-center space-x-4'>
        {/* 언어 드롭다운 */}
        <div className='relative'>
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
              <div className='p-2 h-8 bg-zinc-800 rounded flex items-center justify-center text-white font-bold text-xs'>
                {t('LOGO')}
              </div>
              <button
                className='text-white text-2xl'
                onClick={() => setMobileMenuOpen(false)}>
                <FiX />
              </button>
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
    </nav>
  );
};

export default GNB;
