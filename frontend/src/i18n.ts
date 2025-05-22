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
      SOUND_SETTINGS: '사운드 설정',
      NONE: '없음',
      CLOCK_TICKING: 'Clock Ticking',
      ROBOBIRDS_FX: 'Robobirds FX',
      PREVIEW: '미리듣기',
      SAVE: '저장',
      SAVED: '저장됨',
      ALARM_SOUND_SETTINGS: '알람 사운드 설정',
      FOCUS: '집중',
      BREAK: '휴식',
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
      SOUND_SETTINGS: 'Sound Settings',
      NONE: 'None',
      CLOCK_TICKING: 'Clock Ticking',
      ROBOBIRDS_FX: 'Robobirds FX',
      PREVIEW: 'Preview',
      SAVE: 'Save',
      SAVED: 'Saved',
      ALARM_SOUND_SETTINGS: 'Alarm Sound Settings',
      FOCUS: 'Focus',
      BREAK: 'Break',
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
