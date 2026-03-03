import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function GenericGoalScorer({ match }) {
    const updateGoal = async (teamKey, delta) => {
        const matchRef = doc(db, 'matches', match.id);
        const currentScore = match[teamKey] || 0;
        if (currentScore + delta < 0) return;
        try {
            await updateDoc(matchRef, { [teamKey]: currentScore + delta });
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
            <div className="flex justify-between items-center bg-white/5 p-8 rounded-3xl border border-white/10 shadow-xl">
                <div className="text-center flex-1">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 truncate">{match.team1Name}</div>
                    <div className="text-7xl font-black text-white mb-6">{match.team1Score}</div>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => updateGoal('team1Score', -1)} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">-</button>
                        <button onClick={() => updateGoal('team1Score', 1)} className="w-12 h-12 rounded-xl bg-primary-600 border border-primary-500 text-white font-bold hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all">+</button>
                    </div>
                </div>

                <div className="flex flex-col items-center px-8">
                    <div className="text-xs font-black text-primary-400 mb-2 uppercase tracking-tighter">Half</div>
                    <div className="text-4xl font-black text-white mb-2">{match.half || 1}</div>
                    <div className="w-1 h-12 bg-white/10 rounded-full"></div>
                </div>

                <div className="text-center flex-1">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 truncate">{match.team2Name}</div>
                    <div className="text-7xl font-black text-white mb-6">{match.team2Score}</div>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => updateGoal('team2Score', -1)} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">-</button>
                        <button onClick={() => updateGoal('team2Score', 1)} className="w-12 h-12 rounded-xl bg-primary-600 border border-primary-500 text-white font-bold hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all">+</button>
                    </div>
                </div>
            </div>

            <button onClick={toggleHalf} className="w-full bg-white/5 border border-white/10 hover:border-primary-500/50 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3">
                <span>⏱️</span> Move to Next Half / Break
            </button>
        </div>
    );
}
