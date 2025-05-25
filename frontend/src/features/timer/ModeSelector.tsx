import React from 'react';

const MODE_OPTIONS = [
  { key: 'focus', label: 'FOCUS', bg: '#1e40af' },
  { key: 'break', label: 'BREAK', bg: '#065f46' },
];

interface ModeSelectorProps {
  mode: 'focus' | 'break';
  setMode: (m: 'focus' | 'break') => void;
  t: (key: string, options?: any) => string;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, setMode, t }) => {
  return (
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
              mode === opt.key ? '0 2px 8px 0 rgba(0,0,0,0.12)' : undefined,
          }}
          aria-pressed={mode === opt.key}>
          {t(opt.label)}
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;
