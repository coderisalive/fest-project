import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function BasketballScorer({ match }) {
    const handleScore = async (teamKey, points) => {
        const matchRef = doc(db, 'matches', match.id);
        const currentScore = match[teamKey] || 0;
        try {
            await updateDoc(matchRef, { [teamKey]: currentScore + points });
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
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="text-center">
                    <div className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">{match.team1Name}</div>
                    <div className="text-6xl font-black text-white">{match.team1Score}</div>
                </div>
                <div className="bg-primary-500/20 px-6 py-2 rounded-full border border-primary-500/30 text-primary-400 font-black tracking-widest">
                    Q{match.quarter || 1}
                </div>
                <div className="text-center">
                    <div className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">{match.team2Name}</div>
                    <div className="text-6xl font-black text-white">{match.team2Score}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Team 1 Controls */}
                <div className="space-y-3">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">T1 Points</div>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(pts => (
                            <button key={pts} onClick={() => handleScore('team1Score', pts)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-4 rounded-xl transition-all active:scale-95">+{pts}</button>
                        ))}
                    </div>
                </div>

                {/* Team 2 Controls */}
                <div className="space-y-3">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">T2 Points</div>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(pts => (
                            <button key={pts} onClick={() => handleScore('team2Score', pts)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-4 rounded-xl transition-all active:scale-95">+{pts}</button>
                        ))}
                    </div>
                </div>
            </div>

            <button onClick={nextQuarter} className="w-full bg-secondary-600 hover:bg-secondary-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-secondary-500/20">
                Next Quarter
            </button>
        </div>
    );
}
