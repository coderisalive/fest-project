import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.jsx';

const SchedulePage = () => {
    const { sportId } = useParams();
    const navigate = useNavigate();
    const { userRole } = useAuth();
    const [matches, setMatches] = useState([]);
    const [sport, setSport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Fetch Sport Details
        const fetchSport = async () => {
            try {
                const sportDoc = await getDoc(doc(db, 'sports', sportId));
                if (sportDoc.exists()) {
                    setSport({ id: sportDoc.id, ...sportDoc.data() });
                }
            } catch (err) {
                console.error("Error fetching sport:", err);
            }
        };
        fetchSport();

        // 2. Stream Upcoming Matches
        const q = query(
            collection(db, 'matches'),
            where('sportId', '==', sportId),
            where('status', '==', 'upcoming')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            try {
                const matchData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort by scheduled time - prioritize those with valid dates
                matchData.sort((a, b) => {
                    const dateA = a.scheduledStartTime ? new Date(a.scheduledStartTime) : new Date(0);
                    const dateB = b.scheduledStartTime ? new Date(b.scheduledStartTime) : new Date(0);
                    return dateA - dateB;
                });
                setMatches(matchData);
                setLoading(false);
            } catch (err) {
                console.error("Error processing matches:", err);
                setLoading(false);
            }
        }, (err) => {
            console.error("Snapshot error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [sportId]);

    const handleDeleteSchedule = async (matchId) => {
        if (window.confirm("Are you sure you want to cancel and delete this scheduled match?")) {
            try {
                await deleteDoc(doc(db, 'matches', matchId));
            } catch (err) {
                console.error("Error deleting match:", err);
                alert("Failed to delete. Please try again.");
            }
        }
    };

    const formatTime = (time) => {
        if (!time) return 'TBD';
        try {
            const date = new Date(time);
            if (isNaN(date.getTime())) return 'TBD';
            return date.toLocaleString([], {
                hour: '2-digit',
                minute: '2-digit',
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        } catch (err) {
            return 'TBD';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden pb-20">
            {/* Background Blobs */}
            <div className="absolute top-0 -left-6 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob"></div>

            <div className="pt-28 pb-12 px-4 relative z-10 border-b border-white/5 bg-black mb-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="mb-4">
                            <span className="badge-sporty">Tournament Logistics</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-sporty tracking-tighter mb-4 flex items-center italic">
                            <span className="mr-4 group-hover:scale-110 transition-transform">{sport?.icon || '📅'}</span>
                            <span className="text-white">{sport?.name || 'Tournament'} </span>
                            <span className="text-primary-500 ml-3">Schedule</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-medium italic">All upcoming fixtures and venue details for PRAKRIDA 2026</p>
                    </div>
                    <button
                        onClick={() => navigate('/sports')}
                        className="btn-secondary group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">🔙</span>
                        <span>Back to Sports</span>
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 relative z-10">
                {matches.length === 0 ? (
                    <div className="text-center py-20 glass-card">
                        <span className="text-6xl mb-4 block">📭</span>
                        <h3 className="text-2xl font-bold text-gray-300">No matches scheduled yet</h3>
                        <p className="text-gray-500 mt-2">Check back later for updates or contact Admin.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {matches.map((match) => (
                            <div key={match.id} className="card-arena group hover:border-primary-500/30 transition-all duration-300 relative overflow-hidden mb-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-6 px-8 relative z-10">
                                    {/* Team 1 */}
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 italic">Challenger Alpha</div>
                                        <div className="text-3xl font-sporty text-white group-hover:text-primary-500 transition-colors italic">{match.team1Name}</div>
                                    </div>

                                    {/* VS Info */}
                                    <div className="flex flex-col items-center justify-center min-w-[150px]">
                                        <div className="w-14 h-14 rounded-full bg-black border border-white/10 flex items-center justify-center font-sporty text-xl text-primary-500 mb-3 shadow-2xl shadow-primary-500/10">VS</div>
                                        <div className="badge-sporty py-1 px-4 !text-[8px]">
                                            {match.matchType || 'LEAGUE'} BATTLE
                                        </div>
                                    </div>

                                    {/* Team 2 */}
                                    <div className="flex-1 text-center md:text-right">
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 italic">Challenger Beta</div>
                                        <div className="text-3xl font-sporty text-white group-hover:text-primary-500 transition-colors italic">{match.team2Name}</div>
                                    </div>
                                </div>

                                <div className="border-t border-white/5 bg-white/[0.01] py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                                        <div className="flex items-center text-gray-300 font-black italic text-xs tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                            <span className="mr-3 opacity-70 text-lg">⏰</span>
                                            {formatTime(match.scheduledStartTime)}
                                        </div>
                                        <div className="flex items-center text-primary-400 font-black italic text-xs tracking-widest bg-primary-500/5 px-4 py-2 rounded-lg border border-primary-500/10">
                                            <span className="mr-3 opacity-70 text-lg">📍</span>
                                            {match.venue || 'Main Ground'}
                                        </div>
                                    </div>

                                    {userRole === 'admin' && (
                                        <button
                                            onClick={() => handleDeleteSchedule(match.id)}
                                            className="px-6 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all italic"
                                        >
                                            Terminate Schedule
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchedulePage;
