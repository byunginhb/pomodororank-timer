import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ko: {
    translation: {
      LOGO: 'POMODORO RANK TIMER',
      LOGIN: '로그인',
      LANGUAGE: '언어 선택',
      KOREAN: '한국어',
      ENGLISH: '영어',
      START: '시작',
      PAUSE: '일시정지',
      RESET: '리셋',
      TIMER_LABEL: '{{min}}분 타이머',
      PRESET_MIN: '{{min}}분',
      // 추가 번역 키 필요시 여기에 작성
    },
  },
  en: {
    translation: {
      LOGO: 'POMODORO RANK TIMER',
      LOGIN: 'Login',
      LANGUAGE: 'Language',
      KOREAN: 'Korean',
      ENGLISH: 'English',
      START: 'Start',
      PAUSE: 'Pause',
      RESET: 'Reset',
      TIMER_LABEL: '{{min}}min timer',
      PRESET_MIN: '{{min}}min',
      // 추가 번역 키 필요시 여기에 작성
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'ko',
  fallbackLng: 'ko',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
