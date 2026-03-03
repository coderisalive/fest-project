import { useState, useEffect } from 'react';
import PointsTable from '../components/PointsTable.jsx';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';

const PointsTablePage = () => {
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [pointsData, setPointsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sports'));
        const sportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSports(sportsData);
        if (sportsData.length > 0) setSelectedSport(sportsData[0]);
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
      setLoading(false);
    };

    fetchSports();
  }, []);

  useEffect(() => {
    if (!selectedSport) return;
    const q = query(
      collection(db, 'teams'),
      where('sportId', '==', selectedSport.id),
      orderBy('points', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setPointsData(data);
    });

    return () => unsubscribe();
  }, [selectedSport]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!selectedSport) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center relative overflow-hidden">
        <div className="text-gray-400 text-center glass-card relative z-10 px-12 py-16">
          <span className="text-6xl mb-4 block">🔍</span>
          <h2 className="text-2xl font-bold text-white mb-2">No Sports Found</h2>
          <p>Try adding some from the Admin Panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-16 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-6 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-12 w-96 h-96 bg-secondary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

      <div className="pt-28 pb-8 px-4 relative z-10 border-b border-white/5 bg-gray-900/40 backdrop-blur-xl mb-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400">
            <span className="mr-4 text-5xl">📊</span>
            Points Table
          </h1>
          <p className="text-gray-400 text-lg font-medium">Live sport-wise standings and championship points</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="mb-10 overflow-x-auto hide-scrollbar">
          <div className="flex flex-nowrap md:flex-wrap gap-3 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md w-max min-w-full md:w-auto md:min-w-0">
            {sports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${selectedSport.id === sport.id
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

        <PointsTable sport={selectedSport} pointsData={pointsData} />

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="glass-card hover:border-primary-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full mix-blend-screen filter blur-[64px] opacity-20"></div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center pb-4 border-b border-white/10 relative z-10">
              <span className="mr-3 p-2 bg-primary-500/20 rounded-xl">👑</span>
              {selectedSport.name} ({selectedSport.gender || 'Men'}) Leaders
            </h3>
            <div className="space-y-4 relative z-10">
              {pointsData.slice(0, 3).map((team, index) => (
                <div key={team.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg shadow-inner ${index === 0 ? 'bg-yellow-500 text-yellow-100 shadow-yellow-500/50' :
                    index === 1 ? 'bg-gray-400 text-gray-100 shadow-gray-400/50' :
                      'bg-orange-500 text-orange-100 shadow-orange-500/50'
                    }`}>
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black border border-white/10 bg-gradient-to-br from-indigo-500/50 to-purple-500/50 shadow-inner">
                    {team.college}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-lg tracking-wide">{team.name}</div>
                    <div className="text-sm text-primary-400 font-bold">{team.points || 0} pts</div>
                  </div>
                  <div className="text-right flex items-center space-x-2 text-xs font-black">
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-md">W:{team.won || 0}</span>
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-md">L:{team.lost || 0}</span>
                  </div>
                </div>
              ))}
              {pointsData.length === 0 && (
                <div className="text-center py-8 text-gray-500 italic">No teams have played yet.</div>
              )}
            </div>
          </div>

          <div className="glass-card hover:border-secondary-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary-500 rounded-full mix-blend-screen filter blur-[64px] opacity-20"></div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center pb-4 border-b border-white/10 relative z-10">
              <span className="mr-3 p-2 bg-secondary-500/20 rounded-xl">📉</span>
              {selectedSport.name} Statistics
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="p-6 bg-gradient-to-br from-secondary-500/10 to-indigo-500/10 border border-secondary-500/20 rounded-2xl relative overflow-hidden group-hover:border-secondary-500/40 transition-colors">
                <div className="absolute -right-4 -top-4 text-7xl opacity-10">🎯</div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-secondary-400 uppercase tracking-widest">Competition</span>
                  <span className="text-secondary-300 font-black text-xl">
                    {pointsData.length} Teams
                  </span>
                </div>
                <div className="text-sm text-gray-300 font-medium">Active colleges participating</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 glass-card bg-gradient-to-br from-primary-900/40 to-secondary-900/40 border-primary-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
            <div>
              <h3 className="text-2xl font-black mb-2 text-white flex items-center">
                <span className="text-3xl mr-3">🏅</span> Sport-Specific Championships
              </h3>
              <p className="text-primary-100/80 font-medium md:max-w-xl text-lg">
                Each sport has its own championship. Switch tabs above to track the live performance of your college across different events!
              </p>
            </div>
            <div className="text-center bg-black/30 p-6 rounded-3xl border border-white/10 backdrop-blur-md min-w-[200px] hover:scale-105 transition-transform">
              <div className="text-5xl mb-3 drop-shadow-lg">{selectedSport.icon}</div>
              <div className="text-xs uppercase tracking-widest text-primary-300 font-bold mb-1">Current Leader</div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-primary-200">{pointsData[0]?.college || 'TBD'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsTablePage;
