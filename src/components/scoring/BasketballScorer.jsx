import React from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function BasketballScorer({ match }) {
    const handleScore = async (teamKey, points) => {
        const matchRef = doc(db, 'matches', match.id);
        const currentScore = match[teamKey] || 0;

        // Snapshot for Undo
        const snapshot = {
            team1Score: match.team1Score || 0,
            team2Score: match.team2Score || 0,
            quarter: match.quarter || 1
        };

        try {
            await updateDoc(matchRef, {
                [teamKey]: currentScore + points,
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

    const nextQuarter = async () => {
        if (match.quarter >= 4 && !window.confirm("Move to overtime?")) return;
        const matchRef = doc(db, 'matches', match.id);
        try {
            await updateDoc(matchRef, { quarter: (match.quarter || 1) + 1 });
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-black/40 p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-center relative z-10 flex-1">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{match.team1Name}</div>
                    <div className="text-7xl font-black text-white drop-shadow-2xl">{match.team1Score}</div>
                </div>

                <div className="px-8 flex flex-col items-center relative z-10">
                    <div className="bg-orange-500/20 px-6 py-2 rounded-full border border-orange-500/30 text-orange-400 font-black tracking-[0.3em] text-xs mb-4 shadow-lg shadow-orange-500/10">
                        Q{match.quarter || 1}
                    </div>
                    <div className="w-px h-16 bg-white/10"></div>
                </div>

                <div className="text-center relative z-10 flex-1">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{match.team2Name}</div>
                    <div className="text-7xl font-black text-white drop-shadow-2xl">{match.team2Score}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Team 1 Controls */}
                <div className="space-y-4">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div> T1 Points
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map(pts => (
                            <button key={pts} onClick={() => handleScore('team1Score', pts)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-5 rounded-2xl transition-all active:scale-95 shadow-lg">+{pts}</button>
                        ))}
                    </div>
                </div>

                {/* Team 2 Controls */}
                <div className="space-y-4">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div> T2 Points
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map(pts => (
                            <button key={pts} onClick={() => handleScore('team2Score', pts)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-5 rounded-2xl transition-all active:scale-95 shadow-lg">+{pts}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={nextQuarter} className="flex-1 bg-secondary-600 hover:bg-secondary-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-secondary-500/20 uppercase tracking-[0.2em] text-xs">
                    Next Quarter
                </button>
                {match.history?.length > 0 && (
                    <button onClick={handleUndo} className="w-16 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl flex items-center justify-center text-xl transition-all active:scale-90 shadow-lg">
                        ↩️
                    </button>
                )}
            </div>
        </div>
    );
}
