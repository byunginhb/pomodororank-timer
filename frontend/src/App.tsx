import { useState, useEffect } from 'react';
import GNB from './features/gnb/GNB';
import Timer from './features/timer/Timer';
import packageJson from '../package.json';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Rank from './features/rank/Rank';

function App() {
  const [mode, setMode] = useState<'focus' | 'break'>(
    () => (localStorage.getItem('mode') as 'focus' | 'break') || 'focus'
  );

  useEffect(() => {
    localStorage.setItem('mode', mode);
  }, [mode]);

  return (
    <BrowserRouter>
      <GNB mode={mode} />
      <main>
        <Routes>
          <Route path='/' element={<Timer mode={mode} setMode={setMode} />} />
          <Route path='/rank' element={<Rank />} />
        </Routes>
      </main>
      <div className='fixed bottom-2 right-2 text-xs text-gray-500'>
        v{packageJson.version}
      </div>
    </BrowserRouter>
  );
}

export default App;
