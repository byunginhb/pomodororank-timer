import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../constants/constants';

export default function Mypage() {
  const [nickname, setNickname] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [affiliationInput, setAffiliationInput] = useState('');
  const [affiliationList, setAffiliationList] = useState<string[]>([]);
  const [affiliationDropdownOpen, setAffiliationDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setNickname(userSnap.data().nickname || '');
        setAffiliation(userSnap.data().affiliation || '');
        setAffiliationInput(userSnap.data().affiliation || '');
      }
      // 소속 목록 불러오기
      const q = query(collection(db, 'users'), where('affiliation', '!=', ''));
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
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setMessage('');
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { nickname, affiliation: affiliationInput });
      setAffiliation(affiliationInput);
      setMessage('저장되었습니다!');
    } catch {
      setMessage('저장에 실패했습니다.');
    }
  };

  const handleAffiliationChange = (value: string) => {
    setAffiliationInput(value);
    setAffiliation(value);
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

  if (!user)
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white'>
        로그인이 필요합니다.
      </div>
    );
  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white'>
        로딩 중...
      </div>
    );

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white px-2'>
      <div className='w-full max-w-md bg-white/10 rounded-2xl shadow-lg backdrop-blur-md p-8 flex flex-col items-center'>
        <img src='/logo.png' alt='logo' className='w-20 h-20 mx-auto mb-4' />
        <h2 className='text-3xl font-bold text-center mb-6 drop-shadow'>
          마이페이지
        </h2>
        <label className='block w-full mb-4'>
          <span className='text-white/80 font-semibold'>닉네임</span>
          <input
            className='w-full mt-1 p-3 rounded-lg bg-zinc-900 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
          />
        </label>
        <label className='block w-full mb-6 relative'>
          <span className='text-white/80 font-semibold'>소속</span>
          <input
            className='w-full mt-1 p-3 rounded-lg bg-zinc-900 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
            value={affiliationInput}
            onChange={handleAffiliationInput}
            maxLength={30}
            placeholder='소속을 입력하세요'
            onFocus={() => setAffiliationDropdownOpen(true)}
            onBlur={() =>
              setTimeout(() => setAffiliationDropdownOpen(false), 150)
            }
          />
          {affiliationDropdownOpen && filteredAffiliations.length > 0 && (
            <div className='absolute left-0 right-0 top-full bg-zinc-900 border border-white/10 rounded shadow z-10 max-h-40 overflow-y-auto mt-1'>
              {filteredAffiliations.map((a) => (
                <button
                  key={a}
                  className='w-full text-left px-3 py-2 hover:bg-blue-900/30 text-white'
                  onMouseDown={() => handleAffiliationChange(a)}>
                  {a}
                </button>
              ))}
              {isNewAffiliation && (
                <div className='px-3 py-2 text-blue-400 flex items-center gap-2'>
                  {affiliationInput}
                  <span className='ml-2 text-xs bg-blue-100 text-blue-600 rounded px-2 py-0.5'>
                    NEW
                  </span>
                </div>
              )}
            </div>
          )}
        </label>
        <button
          className='w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg shadow transition mb-2'
          onClick={handleSave}>
          저장
        </button>
        {message && (
          <div className='mt-2 text-center text-white/90 font-semibold'>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
