import React, { useState, useEffect, useRef } from 'react';
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiVolume2,
  FiPause,
  FiPlay,
  FiClock,
  FiAward,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { app, db } from '../../constants/constants';
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { Link, useLocation } from 'react-router-dom';

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
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState(SOUND_OPTIONS[0].value);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Firebase Auth 상태
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth(app);

  // 신규 유저 정보 입력 모달 상태
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [affiliationList, setAffiliationList] = useState<string[]>([]);
  const [affiliationInput, setAffiliationInput] = useState('');
  const [affiliationDropdownOpen, setAffiliationDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // 로그인 성공 시 onAuthStateChanged에서 user가 자동으로 세팅됨
    } catch {
      alert('구글 로그인에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      alert('로그아웃에 실패했습니다.');
    }
  };

  // 사운드 설정 Firestore에서 불러오기
  useEffect(() => {
    if (!user) return;
    (async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().alarmSound) {
        setSelectedSound(userSnap.data().alarmSound);
      }
    })();
  }, [user]);

  // 저장 버튼 클릭 시 Firestore에 저장
  const handleSaveSound = async (value: string) => {
    setSelectedSound(value);
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { alarmSound: value });
    }
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

  // 로그인 후 Firestore에서 유저 정보 확인
  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setShowProfileModal(true);
        }
      }
    };
    checkUserProfile();
  }, [user]);

  // 소속 목록 불러오기
  useEffect(() => {
    if (showProfileModal) {
      (async () => {
        const q = query(
          collection(db, 'users'),
          where('affiliation', '!=', '')
        );
        const snap = await getDocs(q);
        const affs = Array.from(
          new Set(
            snap.docs
              .map((doc) => (doc.data().affiliation || '').trim())
              .filter(Boolean)
          )
        );
        affs.sort((a, b) => a.localeCompare(b));
        setAffiliationList(affs);
      })();
    }
  }, [showProfileModal]);

  // affiliation 입력/선택 핸들러
  const handleAffiliationChange = (value: string) => {
    setAffiliation(value);
    setAffiliationInput(value);
    setAffiliationDropdownOpen(false);
  };

  const handleAffiliationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAffiliationInput(e.target.value);
    setAffiliation(e.target.value);
    setAffiliationDropdownOpen(true);
  };

  const filteredAffiliations = affiliationInput
    ? affiliationList.filter((a) =>
        a.toLowerCase().includes(affiliationInput.toLowerCase())
      )
    : affiliationList;
  const isNewAffiliation =
    affiliationInput && !affiliationList.includes(affiliationInput.trim());

  // 프로필 저장 핸들러
  const handleSaveProfile = async () => {
    setProfileError('');
    if (!nickname.trim()) {
      setProfileError('닉네임을 입력해주세요.');
      return;
    }
    setProfileLoading(true);
    try {
      await setDoc(doc(db, 'users', user!.uid), {
        uid: user!.uid,
        email: user!.email || '',
        nickname: nickname.trim(),
        affiliation: affiliation.trim(),
        totalFocusTime: 0,
        totalBreakTime: 0,
        createdAt: new Date().toISOString(),
      });
      setShowProfileModal(false);
    } catch {
      setProfileError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <>
      {/* 프로필 입력 모달 */}
      {showProfileModal && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/50'>
          <div className='bg-white rounded-lg shadow-lg p-8 w-full max-w-xs flex flex-col gap-4'>
            <h2 className='text-lg font-bold text-gray-800 mb-2'>
              {t('PROFILE_TITLE')}
            </h2>
            <label className='flex flex-col gap-1'>
              <span className='text-sm font-medium text-gray-700'>
                {t('NICKNAME')} <span className='text-red-500'>*</span>
              </span>
              <input
                className='border rounded px-3 py-2 text-gray-900'
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                placeholder={t('NICKNAME')}
                autoFocus
              />
            </label>
            <label className='flex flex-col gap-1 relative'>
              <span className='text-sm font-medium text-gray-700'>
                {t('AFFILIATION')}
              </span>
              <input
                className='border rounded px-3 py-2 text-gray-900'
                value={affiliationInput}
                onChange={handleAffiliationInput}
                maxLength={30}
                placeholder={t('AFFILIATION_PLACEHOLDER')}
                onFocus={() => setAffiliationDropdownOpen(true)}
                onBlur={() =>
                  setTimeout(() => setAffiliationDropdownOpen(false), 150)
                }
              />
              {affiliationDropdownOpen && filteredAffiliations.length > 0 && (
                <div className='absolute left-0 right-0 top-full bg-white border rounded shadow z-10 max-h-40 overflow-y-auto mt-1'>
                  {filteredAffiliations.map((a) => (
                    <button
                      key={a}
                      className='w-full text-left px-3 py-2 hover:bg-blue-100 text-gray-900'
                      onMouseDown={() => handleAffiliationChange(a)}>
                      {a}
                    </button>
                  ))}
                  {isNewAffiliation && (
                    <div className='px-3 py-2 text-blue-600 flex items-center gap-2'>
                      {affiliationInput}
                      <span className='ml-2 text-xs bg-blue-100 text-blue-600 rounded px-2 py-0.5'>
                        {t('NEW_AFFILIATION')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </label>
            {profileError && (
              <div className='text-red-500 text-sm'>{t(profileError)}</div>
            )}
            <button
              className='bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 disabled:opacity-50'
              onClick={handleSaveProfile}
              disabled={profileLoading}>
              {profileLoading ? t('SAVING_PROFILE') : t('SAVE_PROFILE')}
            </button>
          </div>
        </div>
      )}
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
                      i18n.language === lang.code
                        ? 'font-bold text-blue-400'
                        : ''
                    }`}
                    onClick={() => handleLangSelect(lang.code)}>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* 네비게이션 탭 */}
          <nav className='flex items-center gap-1 ml-4 bg-zinc-900/60 rounded-xl px-2 py-1 shadow-inner'>
            <Link
              to='/'
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm
                ${
                  location.pathname === '/'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-blue-200 hover:bg-blue-800/40'
                }`}>
              <FiClock className='text-lg' />
              {t('TIMER')}
            </Link>
            <Link
              to='/rank'
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm
                ${
                  location.pathname.startsWith('/rank')
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-purple-200 hover:bg-purple-800/40'
                }`}>
              <FiAward className='text-lg' />
              {t('RANK')}
            </Link>
          </nav>
          {/* 로그인/로그아웃 버튼 */}
          {user ? (
            <div className='flex items-center space-x-2'>
              <span className='text-white text-sm font-medium'>
                {user.displayName || user.email}
              </span>
              <button
                className='ml-2 px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-800 transition font-semibold text-sm shadow'
                onClick={handleLogout}>
                {t('LOGOUT')}
              </button>
            </div>
          ) : (
            <button
              className='ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-semibold text-sm shadow'
              onClick={handleGoogleLogin}>
              {t('LOGIN')}
            </button>
          )}
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
                <div className='text-xs text-zinc-400 mb-1'>
                  {t('LANGUAGE')}
                </div>
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
              {/* 네비게이션 탭 (모바일) */}
              <nav className='flex items-center gap-2 mb-2'>
                <Link
                  to='/'
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duration-200 text-sm
                    ${
                      location.pathname === '/'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-blue-200 hover:bg-blue-800/40'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}>
                  <FiClock className='text-lg' />
                  {t('TIMER')}
                </Link>
                <Link
                  to='/rank'
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duration-200 text-sm
                    ${
                      location.pathname.startsWith('/rank')
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-purple-200 hover:bg-purple-800/40'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}>
                  <FiAward className='text-lg' />
                  {t('RANK')}
                </Link>
              </nav>
              {/* 로그인/로그아웃 버튼 */}
              {user ? (
                <button
                  className='px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-800 transition font-semibold text-sm shadow w-full'
                  onClick={handleLogout}>
                  {t('LOGOUT')}
                </button>
              ) : (
                <button
                  className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-semibold text-sm shadow w-full'
                  onClick={handleGoogleLogin}>
                  {t('LOGIN')}
                </button>
              )}
            </div>
          </div>
        )}
        <audio ref={previewAudioRef} preload='auto' />
      </nav>
    </>
  );
};

export default GNB;
