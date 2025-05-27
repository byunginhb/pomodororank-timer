import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../constants/constants';
import { useTranslation } from 'react-i18next';

interface UserRank {
  uid: string;
  nickname: string;
  affiliation: string;
  totalFocusTime: number;
  totalBreakTime: number;
}

interface AffiliationRank {
  name: string;
  memberCount: number;
  totalFocusTime: number;
  totalBreakTime: number;
}

type RankType = 'focus' | 'break' | 'sum';
type RankView = 'personal' | 'affiliation';

const Rank: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rankView, setRankView] = useState<RankView>('personal');
  const [rankType, setRankType] = useState<RankType>('focus');

  useEffect(() => {
    setLoading(true);
    setError('');
    (async () => {
      try {
        const q = query(collection(db, 'users'));
        const snap = await getDocs(q);
        const data: UserRank[] = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            uid: d.uid,
            nickname: d.nickname || '',
            affiliation: d.affiliation || '',
            totalFocusTime: d.totalFocusTime || 0,
            totalBreakTime: d.totalBreakTime || 0,
          };
        });
        setUsers(data);
      } catch {
        setError(t('LOAD_FAILED'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  // 소속별 데이터 계산
  const affiliationData = users.reduce<Record<string, AffiliationRank>>(
    (acc, user) => {
      if (!user.affiliation) return acc;

      if (!acc[user.affiliation]) {
        acc[user.affiliation] = {
          name: user.affiliation,
          memberCount: 0,
          totalFocusTime: 0,
          totalBreakTime: 0,
        };
      }

      acc[user.affiliation].memberCount += 1;
      acc[user.affiliation].totalFocusTime += user.totalFocusTime;
      acc[user.affiliation].totalBreakTime += user.totalBreakTime;

      return acc;
    },
    {}
  );

  // 정렬된 개인 랭킹
  const personalRanking = [...users]
    .sort((a, b) => {
      if (rankType === 'focus') return b.totalFocusTime - a.totalFocusTime;
      if (rankType === 'break') return b.totalBreakTime - a.totalBreakTime;
      return (
        b.totalFocusTime +
        b.totalBreakTime -
        (a.totalFocusTime + a.totalBreakTime)
      );
    })
    .slice(0, 10);

  // 정렬된 소속 랭킹
  const affiliationRanking = Object.values(affiliationData)
    .sort((a, b) => {
      if (rankType === 'focus') return b.totalFocusTime - a.totalFocusTime;
      if (rankType === 'break') return b.totalBreakTime - a.totalBreakTime;
      return (
        b.totalFocusTime +
        b.totalBreakTime -
        (a.totalFocusTime + a.totalBreakTime)
      );
    })
    .slice(0, 10);

  const formatTime = (minutes: number) => {
    return (minutes / 60).toFixed(1);
  };

  return (
    <div className='min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-slate-900 via-gray-900 to-black'>
      <div className='max-w-2xl mx-auto'>
        {/* 타이틀 */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-white mb-2'>
            {t('RANKING_TITLE')}
          </h1>
          <p className='text-zinc-400'>
            {t('TOP_10_RANKING', {
              type:
                rankType === 'focus'
                  ? t('FOCUS')
                  : rankType === 'break'
                  ? t('BREAK')
                  : t('TOTAL'),
            })}
          </p>
        </div>

        {/* 랭킹 타입 컨트롤 */}
        <div className='backdrop-blur-md bg-white/10 rounded-2xl p-6 shadow-lg mb-6'>
          <div className='flex flex-col gap-4'>
            {/* 개인/소속 선택 */}
            <div className='flex gap-2 justify-center'>
              <button
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  rankView === 'personal'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                onClick={() => setRankView('personal')}>
                {t('PERSONAL_RANKING')}
              </button>
              <button
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  rankView === 'affiliation'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                onClick={() => setRankView('affiliation')}>
                {t('AFFILIATION_RANKING')}
              </button>
            </div>

            {/* 시간 타입 선택 */}
            <div className='flex gap-2 justify-center'>
              <button
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  rankType === 'focus'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                onClick={() => setRankType('focus')}>
                {t('FOCUS')}
              </button>
              <button
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  rankType === 'break'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                onClick={() => setRankType('break')}>
                {t('BREAK')}
              </button>
              <button
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  rankType === 'sum'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                onClick={() => setRankType('sum')}>
                {t('TOTAL')}
              </button>
            </div>
          </div>
        </div>

        {/* 랭킹 테이블 */}
        <div className='backdrop-blur-md bg-white/10 rounded-2xl overflow-hidden shadow-lg'>
          {loading ? (
            <div className='text-center text-white py-20'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
              {t('LOADING')}
            </div>
          ) : error ? (
            <div className='text-center text-red-400 py-20'>{error}</div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-white/10'>
                    <th className='py-4 px-6 text-left text-sm font-semibold text-white/70'>
                      {t('RANK')}
                    </th>
                    {rankView === 'personal' ? (
                      <>
                        <th className='py-4 px-6 text-left text-sm font-semibold text-white/70'>
                          {t('NICKNAME')}
                        </th>
                        <th className='py-4 px-6 text-left text-sm font-semibold text-white/70'>
                          {t('AFFILIATION')}
                        </th>
                      </>
                    ) : (
                      <>
                        <th className='py-4 px-6 text-left text-sm font-semibold text-white/70'>
                          {t('AFFILIATION')}
                        </th>
                        <th className='py-4 px-6 text-center text-sm font-semibold text-white/70'>
                          {t('MEMBERS')}
                        </th>
                      </>
                    )}
                    <th className='py-4 px-6 text-right text-sm font-semibold text-white/70'>
                      {rankType === 'focus'
                        ? t('TOTAL_FOCUS_TIME')
                        : rankType === 'break'
                        ? t('TOTAL_BREAK_TIME')
                        : t('TOTAL_TIME')}{' '}
                      ({t('TIME_UNIT')})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(rankView === 'personal'
                    ? personalRanking
                    : affiliationRanking
                  ).length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className='text-center py-12 text-white/50'>
                        {t('NO_DATA')}
                      </td>
                    </tr>
                  ) : (
                    (rankView === 'personal'
                      ? personalRanking
                      : affiliationRanking
                    ).map((item, i) => (
                      <tr
                        key={rankView === 'personal' ? item.uid : item.name}
                        className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                          i === 0 ? 'bg-yellow-500/10' : ''
                        }`}>
                        <td className='py-4 px-6'>
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                              i === 0
                                ? 'bg-yellow-500 text-black'
                                : i === 1
                                ? 'bg-zinc-300 text-black'
                                : i === 2
                                ? 'bg-amber-700 text-white'
                                : 'text-white/70'
                            }`}>
                            {i + 1}
                          </span>
                        </td>
                        {rankView === 'personal' ? (
                          <>
                            <td className='py-4 px-6 text-white font-medium'>
                              {(item as UserRank).nickname}
                            </td>
                            <td className='py-4 px-6 text-white/70'>
                              {(item as UserRank).affiliation}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className='py-4 px-6 text-white font-medium'>
                              {(item as AffiliationRank).name}
                            </td>
                            <td className='py-4 px-6 text-center text-white/70'>
                              {(item as AffiliationRank).memberCount}{' '}
                              {t('MEMBERS')}
                            </td>
                          </>
                        )}
                        <td className='py-4 px-6 text-right font-mono text-white'>
                          {rankView === 'personal'
                            ? formatTime(
                                rankType === 'focus'
                                  ? (item as UserRank).totalFocusTime
                                  : rankType === 'break'
                                  ? (item as UserRank).totalBreakTime
                                  : (item as UserRank).totalFocusTime +
                                    (item as UserRank).totalBreakTime
                              )
                            : formatTime(
                                rankType === 'focus'
                                  ? (item as AffiliationRank).totalFocusTime
                                  : rankType === 'break'
                                  ? (item as AffiliationRank).totalBreakTime
                                  : (item as AffiliationRank).totalFocusTime +
                                    (item as AffiliationRank).totalBreakTime
                              )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rank;
