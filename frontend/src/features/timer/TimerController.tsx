import React from 'react';
import { FiPlay, FiPause, FiRotateCw } from 'react-icons/fi';

interface TimerControllerProps {
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  t: (key: string, options?: any) => string;
}

const TimerController: React.FC<TimerControllerProps> = ({
  isRunning,
  start,
  pause,
  reset,
  t,
}) => {
  return (
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
  );
};

export default TimerController;
