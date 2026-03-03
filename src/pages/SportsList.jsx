import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const SportsList = () => {
  const navigate = useNavigate();
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sports'));
        const sportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSports(sportsData);
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
      setLoading(false);
    };

    fetchSports();
  }, []);
  return (
    <div className="min-h-screen bg-black text-white pt-28">
      <div className="bg-black text-white border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-sporty flex items-center">
            <span className="mr-3 text-primary-500">🏆</span>
            <span className="text-white">Sports </span>
            <span className="text-primary-500 ml-2">Events</span>
          </h1>
          <p className="text-gray-400 mt-2 italic font-medium">All sports competitions in PRAKRIDA 2026</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading sports data...</div>
        ) : sports.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-800 rounded-lg border border-dashed border-gray-700">
            No sports are currently active.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sports.map((sport) => (
              <div key={sport.id} className="card-arena group">
                <div className="flex items-start justify-between mb-8">
                  {sport.icon ? (
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-amber-500/30 flex items-center justify-center text-4xl group-hover:bg-amber-500/10 group-hover:border-amber-500/50 transition-all shadow-lg shadow-amber-500/5">
                      {sport.icon}
                    </div>
                  ) : (
                    <div className="h-20"></div> // Spacer to keep layout consistent
                  )}
                  <div className="text-right">
                    <div className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-2">Men & Women</div>
                    <div className="text-amber-500">
                      <svg className="w-6 h-6 ml-auto opacity-40 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Sport Name */}
                <h2 className="text-4xl font-sporty text-white mb-4 group-hover:text-amber-500 transition-colors">
                  {sport.name}
                </h2>

                {/* Description */}
                <p className="text-gray-400 italic text-sm mb-8 leading-relaxed line-clamp-2 h-10">
                  {sport.description || "Witness the ultimate display of skill and determination on the field of glory."}
                </p>

                <div className="w-full h-px bg-white/5 mb-8"></div>

                {/* Accent Divider */}
                <div className="flex items-center gap-2 mb-10">
                  <div className="h-1 w-12 bg-primary-500 rounded-full"></div>
                  <div className="h-1 w-2 bg-primary-500/20 rounded-full"></div>
                  <div className="h-1 w-1 bg-primary-500/10 rounded-full"></div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/schedule/${sport.id}`)}
                    className="flex-grow bg-white text-black font-black italic uppercase text-xs tracking-[0.2em] py-4 rounded-xl hover:bg-amber-500 transition-all font-sporty"
                  >
                    View Schedule
                  </button>
                  <button className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white hover:border-amber-500/50 transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="mr-2">📅</span>
              Tournament Schedule
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div>
                  <div className="font-medium text-blue-400">Group Stage</div>
                  <div className="text-sm text-gray-400">Feb 25-27</div>
                </div>
                <span className="text-blue-400 font-bold">24 matches</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div>
                  <div className="font-medium text-yellow-400">Semi Finals</div>
                  <div className="text-sm text-gray-400">Mar 1</div>
                </div>
                <span className="text-yellow-400 font-bold">8 matches</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsList;
