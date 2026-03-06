import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import CricketScorer from '../components/scoring/CricketScorer';
import BasketballScorer from '../components/scoring/BasketballScorer';
import GenericGoalScorer from '../components/scoring/GenericGoalScorer';
import SetScorer from '../components/scoring/SetScorer';
import { useAuth } from '../contexts/AuthContext';

export default function ScorerMatch() {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedWinnerId, setSelectedWinnerId] = useState(null);

    useEffect(() => {
        if (!matchId) return;

        const matchRef = doc(db, 'matches', matchId);
        const unsubscribe = onSnapshot(matchRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setMatch({ id: docSnap.id, ...data });

                // If match is finished, individual scorers might want to show results, 
                // but we might want to redirect back to dashboard after a certain point or if the user clicks finish.
                // For now, we stay on the page until the user navigates away or we detect status change if we want auto-redirect.
                if (data.status === 'finished') {
                    // Match ended
                }
            } else {
                console.error("Match not found");
                navigate('/scorer/dashboard');
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to match:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [matchId, navigate]);

    const handleEndMatchAndCompute = async () => {
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

                if (!selectedWinnerId) throw "Please select a winner first!";

                const score1 = match.team1Score;
                const score2 = match.team2Score;
                let t1PointsEarned = 0;
                let t2PointsEarned = 0;
                let matchWinnerId = selectedWinnerId;

                t1Data.matchesPlayed = (t1Data.matchesPlayed || 0) + 1;
                t2Data.matchesPlayed = (t2Data.matchesPlayed || 0) + 1;

                if (selectedWinnerId === match.team1Id) {
                    t1PointsEarned = rules.win;
                    t2PointsEarned = rules.loss;
                    t1Data.won = (t1Data.won || 0) + 1;
                    t2Data.lost = (t2Data.lost || 0) + 1;
                } else if (selectedWinnerId === match.team2Id) {
                    t2PointsEarned = rules.win;
                    t1PointsEarned = rules.loss;
                    t2Data.won = (t2Data.won || 0) + 1;
                    t1Data.lost = (t1Data.lost || 0) + 1;
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
            navigate('/scorer/dashboard');

        } catch (err) {
            console.error("Transaction failed: ", err);
            alert("Error calculating match results. See console for details.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!match) return null;

    const baseSportId = match.sportId.split('_')[0]; // Handle dynamic IDs like cricket_men

    return (
        <div className="min-h-screen bg-gray-950 pb-12 relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 -left-6 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-40 -right-6 w-96 h-96 bg-secondary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

            <div className="pt-24 pb-8 px-4 relative z-10 border-b border-white/5 bg-gray-900/40 backdrop-blur-xl mb-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/scorer/dashboard')}
                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-lg"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-white flex items-center uppercase tracking-tight">
                                <span className="text-primary-400 mr-2">●</span> {match.team1Name} vs {match.team2Name}
                            </h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                                {match.sportName || match.sportId} • {match.venue} • {match.matchType}
                            </p>
                        </div>
                    </div>

                    {match.status === 'live' ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full shadow-lg shadow-red-500/10 scale-90 sm:scale-100">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest italic leading-none">Scoring Live</span>
                            </div>
                            <button
                                onClick={handleEndMatchAndCompute}
                                disabled={!selectedWinnerId}
                                className={`bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 active:scale-95 border border-red-500/30 ${!selectedWinnerId ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Finish Match
                            </button>
                        </div>
                    ) : match.status === 'finished' && (
                        <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-xl text-green-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <span>🏆</span> Match Finished
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                {match.status === 'live' && (
                    <div className="mb-8 glass-card border border-white/10 p-6 bg-white/5">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Select Official Winner</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                onClick={() => setSelectedWinnerId(match.team1Id)}
                                className={`px-4 py-3 rounded-xl border font-bold transition-all ${selectedWinnerId === match.team1Id ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            >
                                <div className="text-[10px] uppercase opacity-60 mb-1">Team 1</div>
                                <div className="truncate">{match.team1Name}</div>
                            </button>
                            <button
                                onClick={() => setSelectedWinnerId(match.team2Id)}
                                className={`px-4 py-3 rounded-xl border font-bold transition-all ${selectedWinnerId === match.team2Id ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            >
                                <div className="text-[10px] uppercase opacity-60 mb-1">Team 2</div>
                                <div className="truncate">{match.team2Name}</div>
                            </button>
                            <button
                                onClick={() => setSelectedWinnerId('draw')}
                                className={`px-4 py-3 rounded-xl border font-bold transition-all ${selectedWinnerId === 'draw' ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            >
                                <div className="text-[10px] uppercase opacity-60 mb-1">Outcome</div>
                                <div>DRAW</div>
                            </button>
                        </div>
                        {!selectedWinnerId && (
                            <p className="mt-4 text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest animate-pulse">
                                * Selection required before finishing match
                            </p>
                        )}
                    </div>
                )}

                <div className="glass-card !p-8 border-primary-500/20 shadow-2xl shadow-primary-500/5">
                    {/* Render specific scorer based on sport ID */}
                    {baseSportId === 'cricket' && <CricketScorer match={match} />}
                    {baseSportId === 'basketball' && <BasketballScorer match={match} />}
                    {['football', 'soccer', 'hockey', 'carrom'].includes(baseSportId) && <GenericGoalScorer match={match} />}
                    {['volleyball', 'badminton', 'tabletennis', 'tennis', 'lawntennis'].includes(baseSportId) && <SetScorer match={match} />}

                    {/* Fallback for generic score updates if no specific component exists */}
                    {!['cricket', 'basketball', 'football', 'soccer', 'hockey', 'carrom', 'volleyball', 'badminton', 'tabletennis', 'tennis', 'lawntennis'].includes(baseSportId) && (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-bold text-white mb-4">Generic Scorer</h3>
                            <p className="text-gray-400 mb-8">Use the controls below to manually adjust scores.</p>
                            {/* Generic scoring controls could go here if needed, but for now we expect a component */}
                            <div className="flex items-center justify-center gap-12">
                                <div className="text-center">
                                    <div className="text-gray-500 text-xs font-black uppercase mb-2 tracking-widest">{match.team1Name}</div>
                                    <div className="text-6xl font-black text-white">{match.team1Score}</div>
                                </div>
                                <div className="text-2xl font-black text-gray-700">VS</div>
                                <div className="text-center">
                                    <div className="text-gray-500 text-xs font-black uppercase mb-2 tracking-widest">{match.team2Name}</div>
                                    <div className="text-6xl font-black text-white">{match.team2Score}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
