import React from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function GenericGoalScorer({ match }) {
    const updateGoal = async (teamKey, delta) => {
        const matchRef = doc(db, 'matches', match.id);
        const currentScore = match[teamKey] || 0;
        if (currentScore + delta < 0) return;

        // Snapshot for Undo
        const snapshot = {
            team1Score: match.team1Score || 0,
            team2Score: match.team2Score || 0,
            half: match.half || 1
        };

        try {
            await updateDoc(matchRef, {
                [teamKey]: currentScore + delta,
                history: arrayUnion(snapshot)
            });
        } catch (err) { console.error(err); }
    };

    const handleUndo = async () => {
        if (!match.history || match.history.length === 0) return;
        const lastState = match.history[match.history.length - 1];
        const newHistory = match.history.slice(0, -1);
        try {
            await updateDoc(doc(db, 'matches', match.id), {
                ...lastState,
                history: newHistory
            });
        } catch (err) { console.error(err); }
    };

    const toggleHalf = async () => {
        const matchRef = doc(db, 'matches', match.id);
        try {
            await updateDoc(matchRef, { half: (match.half || 1) + 1 });
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-black/40 p-10 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="text-center flex-1 relative z-10">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 truncate">{match.team1Name}</div>
                    <div className="text-8xl font-black text-white mb-8 transition-transform group-hover:scale-110 duration-500">{match.team1Score}</div>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => updateGoal('team1Score', -1)} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-90">-</button>
                        <button onClick={() => updateGoal('team1Score', 1)} className="w-12 h-12 rounded-xl bg-primary-600 border border-primary-500 text-white font-bold hover:bg-primary-500 shadow-lg shadow-primary-500/30 transition-all active:scale-90">+</button>
                    </div>
                </div>

                <div className="flex flex-col items-center px-12 relative z-10">
                    <div className="text-[10px] font-black text-primary-400 mb-2 uppercase tracking-[0.4em]">Half</div>
                    <div className="text-5xl font-black text-white mb-4 drop-shadow-lg">{match.half || 1}</div>
                    <div className="w-1 h-20 bg-gradient-to-b from-primary-500/50 to-transparent rounded-full"></div>
                </div>

                <div className="text-center flex-1 relative z-10">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 truncate">{match.team2Name}</div>
                    <div className="text-8xl font-black text-white mb-8 transition-transform group-hover:scale-110 duration-500">{match.team2Score}</div>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => updateGoal('team2Score', -1)} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-90">-</button>
                        <button onClick={() => updateGoal('team2Score', 1)} className="w-12 h-12 rounded-xl bg-primary-600 border border-primary-500 text-white font-bold hover:bg-primary-500 shadow-lg shadow-primary-500/30 transition-all active:scale-90">+</button>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={toggleHalf} className="flex-1 bg-white/5 border border-white/10 hover:border-primary-500/50 hover:bg-white/10 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs shadow-xl">
                    <span>⏱️</span> Next Half / Break
                </button>
                {match.history?.length > 0 && (
                    <button onClick={handleUndo} className="w-16 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl flex items-center justify-center text-xl transition-all active:scale-90">
                        ↩️
                    </button>
                )}
            </div>
        </div>
    );
}
