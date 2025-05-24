import { useState, useEffect } from 'react';
import GNB from './features/gnb/GNB';
import Timer from './features/timer/Timer';
import packageJson from '../package.json';

function App() {
  const [mode, setMode] = useState<'focus' | 'break'>(
    () => (localStorage.getItem('mode') as 'focus' | 'break') || 'focus'
  );

  useEffect(() => {
    localStorage.setItem('mode', mode);
  }, [mode]);

  return (
    <>
      <GNB mode={mode} />
      <main>
        <Timer mode={mode} setMode={setMode} />
      </main>
      <div className='fixed bottom-2 right-2 text-xs text-gray-500'>
        v{packageJson.version}
      </div>
    </>
  );
}

export default App;
