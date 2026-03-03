import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import heroBg from '../assets/demon-slayer-the-hashira-kneel-at-the-arrival-of-ubuyashiki.avif';
import logo from '../assets/download.png';

const Home = () => {
  const [sportsList, setSportsList] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const eventDates = "March 12 - 15, 2026";
  const eventLocation = "Birla Institute of Technology, Mesra Patna Campus";

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch Sports
        const sportsSnapshot = await getDocs(collection(db, 'sports'));
        const sportsData = sportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSportsList(sportsData);

        // Fetch Teams to derive Colleges
        const teamsSnapshot = await getDocs(collection(db, 'teams'));
        const teamsData = teamsSnapshot.docs.map(doc => doc.data());

        // Extract unique colleges
        const uniqueColleges = Array.from(new Set(teamsData.map(team => team.college)))
          .filter(Boolean)
          .map((name, index) => ({
            id: index,
            name: name,
            shortName: name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 3),
            color: `hsl(${(index * 137) % 360}, 70%, 50%)` // Generate consistent colors
          }));

        setCollegesList(uniqueColleges);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-100 overflow-hidden relative">
      {/* Hero Section with Dedicated Background */}
      <div className="relative h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Hero Background"
            className="w-full h-full object-cover object-center opacity-40 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 pt-20 px-4 mx-auto max-w-7xl animate-fade-in text-center">
          <div className="flex justify-center mb-8">
            <img
              src={logo}
              alt="PRAKRIDA 2026"
              className="h-32 sm:h-48 md:h-64 object-contain drop-shadow-[0_0_30_rgba(245,158,11,0.3)] animate-float"
            />
          </div>

          <p className="text-lg sm:text-2xl text-gray-300 font-medium mb-12 max-w-2xl mx-auto leading-relaxed italic drop-shadow-lg">
            Choose your battlefield. Prove your mettle. Glory awaits the victors in Prakida's most intense sporting showdowns.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-400 font-medium text-lg mb-12">
            <div className="glass px-6 py-3 rounded-full flex items-center space-x-3 backdrop-blur-md border-white/5 shadow-xl">
              <span className="text-xl">📅</span>
              <span className="italic">{eventDates}</span>
            </div>
            <div className="glass px-6 py-3 rounded-full flex items-center space-x-3 backdrop-blur-md border-white/5 shadow-xl">
              <span className="text-xl">📍</span>
              <span className="italic text-xs sm:text-base">{eventLocation}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-10">
            <Link to="/live-matches" className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,1)]"></div>
              <span>Watch Live Matches</span>
            </Link>
            <Link to="/sports" className="btn-secondary text-lg px-8 py-4 backdrop-blur-md">
              Explore Sports
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 animate-slide-up">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Colleges */}
            <div className="glass-card flex flex-col h-full border-t border-l border-white/10 border-r-0 border-b-0">
              <h2 className="text-3xl font-sporty text-white mb-8 flex items-center italic">
                <span className="mr-3 text-2xl text-primary-500 bg-primary-500/10 p-2 rounded-lg">🎓</span>
                Competing Titans
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 flex-grow">
                {collegesList.length > 0 ? (
                  collegesList.map((college) => (
                    <div key={college.id} className="group flex items-center space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 cursor-default">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg transform group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: college.color, boxShadow: `0 4px 14px 0 ${college.color}60` }}
                      >
                        {college.shortName}
                      </div>
                      <div>
                        <div className="font-bold text-gray-100 group-hover:text-white transition-colors">{college.name}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center text-gray-500 italic">No colleges registered yet.</div>
                )}
              </div>
            </div>

            {/* Sports */}
            <div className="glass-card flex flex-col h-full border-t border-l border-white/10 border-r-0 border-b-0">
              <h2 className="text-3xl font-sporty text-white mb-8 flex items-center italic">
                <span className="mr-3 text-2xl text-primary-500 bg-primary-500/10 p-2 rounded-lg">🏆</span>
                Championship Events
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 flex-grow">
                {sportsList.length > 0 ? (
                  sportsList.slice(0, 10).map((sport) => (
                    <div key={sport.id} className="group flex items-center space-x-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 transition-all duration-300 cursor-default relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {sport.icon && (
                        <div className="w-14 h-14 rounded-xl bg-white/5 border border-amber-500/20 flex items-center justify-center text-2xl shadow-inner group-hover:bg-amber-500/10 group-hover:border-amber-500/40 transition-all relative z-10">
                          {sport.icon}
                        </div>
                      )}
                      <div className="relative z-10 flex-grow">
                        <div className="font-sporty text-lg text-white group-hover:text-amber-500 transition-colors italic uppercase">{sport.name}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center text-gray-500 italic">No sports cataloged yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="glass-card text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-4 transform group-hover:-translate-y-2 transition-transform duration-300">🏃</div>
              <h3 className="text-3xl font-black text-white mb-2">{sportsList.length}</h3>
              <p className="text-gray-400 font-medium uppercase tracking-wider text-sm">Disciplines</p>
            </div>
          </div>

          <div className="glass-card text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-secondary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-4 transform group-hover:-translate-y-2 transition-transform duration-300">🎓</div>
              <h3 className="text-3xl font-black text-white mb-2">{collegesList.length}</h3>
              <p className="text-gray-400 font-medium uppercase tracking-wider text-sm">Colleges</p>
            </div>
          </div>

          <div className="glass-card text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-4 transform group-hover:-translate-y-2 transition-transform duration-300">🏆</div>
              <h3 className="text-3xl font-black text-white mb-2">4</h3>
              <p className="text-gray-400 font-medium uppercase tracking-wider text-sm">Days of Glory</p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-16 glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border-t-0 border-l-0 border-r border-b border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-secondary-600/20 to-accent-600/20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-md">Witness Greatness Real-Time</h2>
            <p className="text-xl mb-10 text-gray-300 max-w-2xl mx-auto font-medium">
              Dive into the live action, track the leaderboard, and support your college as they battle for the ultimate championship trophy.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link to="/points-table" className="btn-primary text-lg px-10 py-4 shadow-xl shadow-primary-500/20">
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
