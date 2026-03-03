import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';

const MatchResults = () => {
  const [sports, setSports] = useState([]);
  const [selectedSportId, setSelectedSportId] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sports'));
        const sportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSports(sportsData);
      } catch (error) {
        console.error("Error fetching sports:", error);
      }

      const q = query(
        collection(db, 'matches'),
        where('status', '==', 'finished'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const matchData = [];
        snapshot.forEach(doc => {
          matchData.push({ id: doc.id, ...doc.data() });
        });
        setResults(matchData);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribePromise = fetchData();
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);

  const getResultsBySport = (matches) => {
    const grouped = {};
    matches.forEach(match => {
      if (!match) return;
      const sName = match.sportName || 'Unknown Sport';
      const gen = match.gender || 'Men';
      const sportLabel = `${sName} (${gen})`;

      if (!grouped[sportLabel]) {
        grouped[sportLabel] = {};
      }
      if (!grouped[sportLabel][gen]) {
        grouped[sportLabel][gen] = [];
      }
      grouped[sportLabel][gen].push(match);
    });
    return grouped;
  };

  const filteredResultsList = selectedSportId === 'all'
    ? results
    : results.filter(r => {
      if (!r) return false;
      if (r.sportId === selectedSportId) return true;
      const sName = (r.sportName || '').toLowerCase().replace(/\s+/g, '');
      const gen = (r.gender || 'men').toLowerCase();
      return `${sName}_${gen}` === selectedSportId;
    });

  const resultsBySport = getResultsBySport(filteredResultsList);

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Unknown Date';
    }
  };

  const isToday = (dateString) => dateString && dateString === today;

  const getWinnerInfo = (match) => {
    if (match.team1Score > match.team2Score) return { name: match.team1Name, id: match.team1Id };
    if (match.team2Score > match.team1Score) return { name: match.team2Name, id: match.team2Id };
    return { name: 'Draw', id: null };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 -left-6 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-4000"></div>

      <div className="pt-28 pb-4 px-4 relative z-10 border-b border-white/5 bg-gray-900/40 backdrop-blur-xl mb-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
            <span className="mr-4 text-5xl">🏆</span>
            Match Results
          </h1>
          <p className="text-gray-400 text-lg font-medium">Final scores and winners from completed events</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Sport Selection Bar */}
        <div className="mb-10 overflow-x-auto hide-scrollbar">
          <div className="flex flex-nowrap md:flex-wrap gap-3 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md w-max min-w-full md:w-auto md:min-w-0">
            <button
              onClick={() => setSelectedSportId('all')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${selectedSportId === 'all'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10'
                }`}
            >
              <span className="text-xl">🌟</span>
              <span className="whitespace-nowrap">Show All</span>
            </button>
            {sports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSportId(sport.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${selectedSportId === sport.id
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10'
                  }`}
              >
                <span className="text-xl drop-shadow-md">{sport.icon}</span>
                <span className="whitespace-nowrap">{sport.name} <span className="opacity-50 text-[10px]">({sport.gender || 'Men'})</span></span>
              </button>
            ))}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-24 glass-card border-dashed border-white/10">
            <span className="text-7xl block mb-6 opacity-30">🏁</span>
            <h2 className="text-2xl font-bold text-white mb-2">No Results Yet</h2>
            <p className="text-gray-400 max-w-md mx-auto">Matches will appear here as soon as they are finalized by the scorekeepers.</p>
          </div>
        ) : (
          Object.entries(resultsBySport).map(([sportLabel, genders]) => (
            <div key={sportLabel} className="mb-16">
              <div className="flex items-center mb-8 pl-2 space-x-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center border border-primary-500/20 shadow-inner">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                    {sportLabel}
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-primary-500 to-transparent mt-1 rounded-full"></div>
                </div>
              </div>

              {Object.entries(genders).map(([gender, matches]) => (
                <div key={gender} className="mb-10 last:mb-0">
                  <div className="flex items-center mb-6 pl-4">
                    <div className={`h-6 w-1 rounded-full mr-3 ${gender === 'Women' ? 'bg-pink-500' : 'bg-blue-500'}`}></div>
                    <h3 className="text-lg font-bold text-gray-300 tracking-wider">
                      {gender === 'Women' ? "Girls' / Women's" : "Boys' / Men's"} Division
                    </h3>
                    <span className="ml-4 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-500 font-bold uppercase">
                      {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
                    </span>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {matches.map((match) => {
                      const winner = getWinnerInfo(match);
                      const isCricket = match.sportId?.toLowerCase().includes('cricket') || match.sportName?.toLowerCase().includes('cricket');
                      const matchDate = match.completedAt ? match.completedAt.split('T')[0] : (match.createdAt ? match.createdAt.split('T')[0] : null);

                      return (
                        <div key={match.id} className="group glass-card p-6 hover:border-primary-500/30 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500 rounded-full mix-blend-screen filter blur-[48px] opacity-0 group-hover:opacity-10 transition-opacity"></div>

                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                              {isToday(matchDate) && (
                                <span className="px-2 py-0.5 bg-primary-500/20 text-primary-300 text-[10px] font-black rounded-md border border-primary-500/30 uppercase tracking-widest">
                                  Today
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 uppercase">
                                {formatDate(matchDate)}
                              </span>
                            </div>
                            <span className="px-3 py-1 text-[10px] font-black text-white rounded-full bg-green-500/80 shadow-lg shadow-green-500/20 uppercase tracking-widest">
                              {match.matchType || 'Final'}
                            </span>
                          </div>

                          <div className="space-y-4">
                            <div className={`flex items-center justify-between p-3 rounded-2xl transition-all ${winner.id === match.team1Id ? 'bg-primary-500/10 border border-primary-500/20 shadow-inner' : 'bg-black/20 border border-transparent'}`}>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs border border-white/10 bg-gradient-to-br from-gray-700 to-gray-800 shadow-inner">
                                  {match.team1Name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className={`font-bold text-sm tracking-tight ${winner.id === match.team1Id ? 'text-white' : 'text-gray-400'}`}>{match.team1Name}</span>
                              </div>
                              <div className="text-xl font-black text-white">
                                {isCricket ? (match.team1Score || 0) : match.team1Score}
                              </div>
                            </div>

                            <div className="flex items-center justify-center">
                              <div className="h-[1px] flex-1 bg-white/5"></div>
                              <span className="mx-4 text-xs font-black text-gray-600 uppercase tracking-widest">VS</span>
                              <div className="h-[1px] flex-1 bg-white/5"></div>
                            </div>

                            <div className={`flex items-center justify-between p-3 rounded-2xl transition-all ${winner.id === match.team2Id ? 'bg-primary-500/10 border border-primary-500/20 shadow-inner' : 'bg-black/20 border border-transparent'}`}>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs border border-white/10 bg-gradient-to-br from-gray-700 to-gray-800 shadow-inner">
                                  {match.team2Name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className={`font-bold text-sm tracking-tight ${winner.id === match.team2Id ? 'text-white' : 'text-gray-400'}`}>{match.team2Name}</span>
                              </div>
                              <div className="text-xl font-black text-white">
                                {isCricket ? (match.team2Score || 0) : match.team2Score}
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-xs flex items-center">
                              <span className="mr-1.5 opacity-50">🏆</span>
                              <span className="text-primary-400">Winner: {winner.name}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchResults;
