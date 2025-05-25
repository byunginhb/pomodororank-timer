import React from 'react';

interface PresetSelectorProps {
  presets: number[];
  duration: number;
  isRunning: boolean;
  setDuration: (m: number) => void;
  t: (key: string, options?: any) => string;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({
  presets,
  duration,
  isRunning,
  setDuration,
  t,
}) => {
  return (
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
  );
};

export default PresetSelector;
