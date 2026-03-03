import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc, runTransaction } from 'firebase/firestore';
import CricketScorer from '../components/scoring/CricketScorer';
import BasketballScorer from '../components/scoring/BasketballScorer';
import GenericGoalScorer from '../components/scoring/GenericGoalScorer';
import KabaddiScorer from '../components/scoring/KabaddiScorer';
import SetScorer from '../components/scoring/SetScorer';
import ChessScorer from '../components/scoring/ChessScorer';
import TennisScorer from '../components/scoring/TennisScorer';
import RulesModal from '../components/scoring/RulesModal';
import { sportRules } from '../data/sportRules';

export default function ScorerDashboard() {
    const { currentUser } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRules, setSelectedRules] = useState(null);

    useEffect(() => {
        const q = query(
            collection(db, 'matches'),
            where('status', 'in', ['upcoming', 'live'])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const liveMatches = [];
            snapshot.forEach((doc) => {
                liveMatches.push({ id: doc.id, ...doc.data() });
            });
            liveMatches.sort((a, b) => a.status === 'live' ? -1 : 1);
            setMatches(liveMatches);
            setLoading(false);
        }, (error) => {
            console.error("Error subscribing to matches:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const isMatchReady = (startTime) => {
        if (!startTime) return true;
        const start = new Date(startTime).getTime();
        const now = new Date().getTime();
        const diffMinutes = (start - now) / (1000 * 60);
        return diffMinutes <= 45;
    };

    const formatStartTime = (startTime) => {
        if (!startTime) return '';
        return new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleStartMatch = async (matchId) => {
        try {
            await updateDoc(doc(db, 'matches', matchId), { status: 'live' });
        } catch (err) {
            console.error("Failed to start match", err);
        }
    };

    const handleUpdateScore = async (matchId, teamKey, newScore) => {
        if (newScore < 0) return;
        try {
            await updateDoc(doc(db, 'matches', matchId), { [teamKey]: newScore });
        } catch (err) {
            console.error("Failed to update score", err);
        }
    };

    const handleEndMatchAndCompute = async (match) => {
        if (!window.confirm("Are you sure you want to end this match? This will definitively compute and write the final points to the leaderboard.")) return;

        try {
            await runTransaction(db, async (transaction) => {
                const sportRef = doc(db, 'sports', match.sportId.toString());
                const sportDoc = await transaction.get(sportRef);
                if (!sportDoc.exists()) throw "Sport configuration not found!";

                const rules = sportDoc.data().scoringRules || { win: 3, draw: 1, loss: 0 };

                const team1Ref = doc(db, 'teams', match.team1Id);
                const team2Ref = doc(db, 'teams', match.team2Id);
                const team1Doc = await transaction.get(team1Ref);
                const team2Doc = await transaction.get(team2Ref);
                if (!team1Doc.exists() || !team2Doc.exists()) throw "One or both teams not found!";

                let t1Data = team1Doc.data();
                let t2Data = team2Doc.data();

                const score1 = match.team1Score;
                const score2 = match.team2Score;
                let t1PointsEarned = 0;
                let t2PointsEarned = 0;
                let matchWinnerId = null;

                t1Data.matchesPlayed = (t1Data.matchesPlayed || 0) + 1;
                t2Data.matchesPlayed = (t2Data.matchesPlayed || 0) + 1;

                if (score1 > score2) {
                    t1PointsEarned = rules.win;
                    t2PointsEarned = rules.loss;
                    t1Data.won = (t1Data.won || 0) + 1;
                    t2Data.lost = (t2Data.lost || 0) + 1;
                    matchWinnerId = match.team1Id;
                } else if (score2 > score1) {
                    t2PointsEarned = rules.win;
                    t1PointsEarned = rules.loss;
                    t2Data.won = (t2Data.won || 0) + 1;
                    t1Data.lost = (t1Data.lost || 0) + 1;
                    matchWinnerId = match.team2Id;
                } else {
                    t1PointsEarned = rules.draw;
                    t2PointsEarned = rules.draw;
                    t1Data.drawn = (t1Data.drawn || 0) + 1;
                    t2Data.drawn = (t2Data.drawn || 0) + 1;
                    matchWinnerId = 'draw';
                }

                t1Data.points = (t1Data.points || 0) + t1PointsEarned;
                t2Data.points = (t2Data.points || 0) + t2PointsEarned;

                transaction.update(team1Ref, t1Data);
                transaction.update(team2Ref, t2Data);

                const matchRef = doc(db, 'matches', match.id);
                transaction.update(matchRef, {
                    status: 'finished',
                    winnerId: matchWinnerId
                });
            });

            alert("Match ended successfully! Points have been calculated and added to the leaderboard.");

        } catch (err) {
            console.error("Transaction failed: ", err);
            alert("Error calculating match results. See console for details.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 pb-12 relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 -left-6 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-40 -right-6 w-96 h-96 bg-secondary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

            <div className="pt-28 pb-8 px-4 relative z-10 border-b border-white/5 bg-gray-900/40 backdrop-blur-xl mb-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400 drop-shadow-sm mb-2">
                            <span className="mr-3 text-4xl">📝</span>
                            Scorer Control Panel
                        </h1>
                        <p className="text-gray-400 font-medium">Dashboard Access: {currentUser?.email}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="glass-card">
                    <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                        Active Assignments
                    </h2>

                    {loading ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p>Loading matches...</p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="text-gray-400 text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                            <span className="text-4xl block mb-4">📭</span>
                            <p className="text-lg font-medium">No live or upcoming matches found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                            {matches.map(match => (
                                <div key={match.id} className={`glass relative overflow-hidden rounded-2xl p-6 ${match.status === 'live' ? 'border-primary-500/30 bg-primary-900/10 shadow-primary-500/10' : 'border-white/10 shadow-lg'}`}>
                                    {/* Accent border strip */}
                                    <div className={`absolute top-0 left-0 w-2 h-full ${match.status === 'live' ? 'bg-primary-500' : 'bg-yellow-500'}`}></div>

                                    <div className="flex justify-between items-center mb-6 pl-2">
                                        <div className="flex items-center space-x-3">
                                            <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5">Stadium</span>
                                            <div>
                                                <div className="font-bold uppercase tracking-widest text-white">
                                                    {match.sportName || match.sportId}
                                                    <span className="text-primary-400 text-[10px] ml-2">[{match.matchType || 'League'}]</span>
                                                    <span className="text-secondary-400 text-[10px] ml-2">({match.gender || 'Boys'})</span>
                                                </div>
                                                <div className="text-xs text-gray-400 tracking-wider">ID: {match.id.substring(0, 8)}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end space-y-2">
                                            {match.status === 'live' ? (
                                                <span className="bg-primary-500/20 border border-primary-500/50 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse flex items-center space-x-2 shadow-lg shadow-primary-500/20">
                                                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                                                    <span>LIVE</span>
                                                </span>
                                            ) : (
                                                <div className="flex flex-col items-end">
                                                    <span className="bg-white/10 border border-white/20 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-full mb-1">UPCOMING</span>
                                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{formatStartTime(match.scheduledStartTime)}</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setSelectedRules({ id: match.sportId, data: sportRules[match.sportId] })}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors underline decoration-primary-500/30 underline-offset-4"
                                            >
                                                View Rules
                                            </button>
                                        </div>
                                    </div>

                                    {/* Detailed Scoring Section */}
                                    <div className="mt-8">
                                        {match.status === 'live' ? (
                                            <div className="animate-fade-in">
                                                {match.sportId === 'cricket' && <CricketScorer match={match} />}
                                                {match.sportId === 'basketball' && <BasketballScorer match={match} />}
                                                {['football', 'hockey'].includes(match.sportId) && <GenericGoalScorer match={match} />}
                                                {match.sportId === 'kabaddi' && <KabaddiScorer match={match} />}
                                                {['volleyball', 'badminton', 'tabletennis'].includes(match.sportId) && <SetScorer match={match} />}
                                                {match.sportId === 'chess' && <ChessScorer match={match} />}
                                                {match.sportId === 'tennis' && <TennisScorer match={match} />}

                                                {!['cricket', 'basketball', 'football', 'hockey', 'kabaddi', 'volleyball', 'badminton', 'tabletennis', 'chess', 'tennis'].includes(match.sportId) && (
                                                    <div className="grid grid-cols-5 gap-4 items-center pl-2">
                                                        <div className="col-span-2 flex flex-col items-center bg-white/5 p-4 rounded-xl border border-white/10 relative group">
                                                            <div className="font-bold text-center text-white mb-4 h-12 flex items-center">{match.team1Name}</div>
                                                            <div className="flex flex-col items-center space-y-3">
                                                                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-lg">{match.team1Score}</span>
                                                                <div className="flex space-x-2 pt-2">
                                                                    <button onClick={() => handleUpdateScore(match.id, 'team1Score', match.team1Score - 1)} className="bg-gray-800 hover:bg-gray-700 border border-white/10 text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold transition-colors shadow-inner">-</button>
                                                                    <button onClick={() => handleUpdateScore(match.id, 'team1Score', match.team1Score + 1)} className="bg-primary-600 hover:bg-primary-500 text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold shadow-lg shadow-primary-500/30 transition-colors">+</button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-span-1 flex justify-center items-center h-full relative">
                                                            <div className="absolute w-[2px] h-full bg-white/5"></div>
                                                            <div className="bg-gray-900 border border-white/10 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 relative z-10 font-mono">VS</div>
                                                        </div>

                                                        <div className="col-span-2 flex flex-col items-center bg-white/5 p-4 rounded-xl border border-white/10 relative group">
                                                            <div className="font-bold text-center text-white mb-4 h-12 flex items-center">{match.team2Name}</div>
                                                            <div className="flex flex-col items-center space-y-3">
                                                                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-lg">{match.team2Score}</span>
                                                                <div className="flex space-x-2 pt-2">
                                                                    <button onClick={() => handleUpdateScore(match.id, 'team2Score', match.team2Score - 1)} className="bg-gray-800 hover:bg-gray-700 border border-white/10 text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold transition-colors shadow-inner">-</button>
                                                                    <button onClick={() => handleUpdateScore(match.id, 'team2Score', match.team2Score + 1)} className="bg-primary-600 hover:bg-primary-500 text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold shadow-lg shadow-primary-500/30 transition-colors">+</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col justify-center items-center py-6">
                                                <div className="flex justify-center items-center space-x-8 opacity-50 grayscale mb-4">
                                                    <div className="text-center">
                                                        <div className="font-bold text-white mb-2">{match.team1Name}</div>
                                                        <div className="text-4xl font-black text-gray-400">{match.team1Score}</div>
                                                    </div>
                                                    <div className="text-xs font-bold text-gray-600 font-mono">VS</div>
                                                    <div className="text-center">
                                                        <div className="font-bold text-white mb-2">{match.team2Name}</div>
                                                        <div className="text-4xl font-black text-gray-400">{match.team2Score}</div>
                                                    </div>
                                                </div>
                                                {!isMatchReady(match.scheduledStartTime) && (
                                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center max-w-sm">
                                                        <span className="text-xl mb-1 block">⏳</span>
                                                        <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest">Initialization Locked</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                            Score recording opens 45 mins before {formatStartTime(match.scheduledStartTime)}.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/10 pl-2">
                                        {match.status === 'upcoming' ? (
                                            <button
                                                onClick={() => handleStartMatch(match.id)}
                                                disabled={!isMatchReady(match.scheduledStartTime)}
                                                className={`w-full shadow-lg text-lg py-3 flex items-center justify-center space-x-2 transition-all rounded-xl font-bold ${isMatchReady(match.scheduledStartTime)
                                                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-primary-500/20 hover:scale-[1.02]'
                                                    : 'bg-white/5 text-gray-500 cursor-not-allowed opacity-50 grayscale'
                                                    }`}
                                            >
                                                <span>{isMatchReady(match.scheduledStartTime) ? '▶' : '🔒'}</span>
                                                <span>{isMatchReady(match.scheduledStartTime) ? 'Start Match Recording' : 'Recording Unavailable'}</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEndMatchAndCompute(match)}
                                                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-red-500/50 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center space-x-2 group"
                                            >
                                                <span className="text-xl group-hover:animate-bounce">⏹</span>
                                                <span>Finalize Match & Compute</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <RulesModal
                isOpen={!!selectedRules}
                onClose={() => setSelectedRules(null)}
                sportId={selectedRules?.id}
                rules={selectedRules?.data}
            />
        </div>
    );
}
