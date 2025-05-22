import { useState, useEffect } from 'react';
import GNB from './features/gnb/GNB';
import Timer from './features/timer/Timer';

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
    </>
  );
}

export default App;
