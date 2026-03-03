import { useState, useEffect } from 'react';
import ScoreBoard from '../components/ScoreBoard.jsx';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'matches'),
      where('status', 'in', ['live', 'upcoming'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchData = [];
      snapshot.forEach(doc => {
        matchData.push({ id: doc.id, ...doc.data() });
      });
      // Sort live matches first
      matchData.sort((a, b) => a.status === 'live' ? -1 : 1);
      setMatches(matchData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-12">
      <div className="bg-black text-white border-b border-white/5 pt-28">
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-4">
                <span className="badge-sporty">Real-Time Battlefield Analysis</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-sporty tracking-tighter italic">
                <span className="text-white drop-shadow-md">LIVE </span>
                <span className="text-primary-500 drop-shadow-md">MATCHES</span>
              </h1>
              <p className="text-gray-400 mt-4 italic font-medium">Real-time scores and updates from ongoing matches</p>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center space-x-3 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,1)]"></div>
                <span className="text-sm font-black text-red-400 uppercase tracking-widest italic">Live Action</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 glass-card border border-primary-500/10 bg-white/[0.02] p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-3xl mr-6 border border-primary-500/20">
              ⚡
            </div>
            <div>
              <h3 className="font-sporty text-xl text-white italic tracking-tight">Rapid Impact Scoring</h3>
              <p className="text-gray-400 text-sm italic font-medium mt-1">
                Field data is transmitted in real-time. Seconds matter.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 w-2/3 animate-pulse"></div>
            </div>
            <span className="text-[10px] font-black tracking-widest text-primary-500 uppercase">Syncing...</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium italic">INITIALIZING BATTLEFIELD DATA...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-24 glass-card border-dashed border-white/10 opacity-60">
            <div className="text-5xl mb-6 opacity-30">🕶️</div>
            <h3 className="text-2xl font-sporty text-gray-400 italic">No Active Skirmishes</h3>
            <p className="text-gray-600 mt-2 italic font-medium">The arena is quiet. For now.</p>
          </div>
        ) : (
          <ScoreBoard title="Currently Active" matches={matches} isLive={true} />
        )}

        <div className="mt-20 grid gap-8 md:grid-cols-1 max-w-2xl mx-auto">
          <div className="card-arena bg-primary-500/5 group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4h2v4zm0-6h-2V7h2v4zm-4 6H8v-2h2v2zm0-4H8V9h2v4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-sporty text-white mb-8 flex items-center italic">
              <span className="mr-3 text-primary-500">📊</span>
              Today's Field Intelligence
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-5 bg-white/[0.03] border border-white/5 rounded-2xl group-hover:border-primary-500/20 transition-all">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">Total Deployments</span>
                <span className="font-sporty text-2xl text-white">{matches.length}</span>
              </div>
              <div className="flex justify-between items-center p-5 bg-white/[0.03] border border-white/5 rounded-2xl group-hover:border-primary-500/20 transition-all">
                <span className="text-red-400 font-bold uppercase tracking-widest text-xs italic">Active Battles</span>
                <span className="font-sporty text-2xl text-red-500">{matches.filter(m => m.status === 'live').length}</span>
              </div>
              <div className="flex justify-between items-center p-5 bg-white/[0.03] border border-white/5 rounded-2xl group-hover:border-primary-500/20 transition-all">
                <span className="text-primary-400 font-bold uppercase tracking-widest text-xs italic">Pending Operations</span>
                <span className="font-sporty text-2xl text-primary-500">{matches.filter(m => m.status === 'upcoming').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMatches;
