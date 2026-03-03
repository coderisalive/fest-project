import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function KabaddiScorer({ match }) {
    const handleScore = async (teamKey, type, points) => {
        const matchRef = doc(db, 'matches', match.id);
        const currentScore = match[teamKey] || 0;

        // We could track individual point types in Firestore if needed, 
        // but for now we update the main team score.
        try {
            await updateDoc(matchRef, { [teamKey]: currentScore + points });
        } catch (err) { console.error(err); }
    };

    const toggleHalf = async () => {
        const matchRef = doc(db, 'matches', match.id);
        try {
            await updateDoc(matchRef, { half: (match.half || 1) + 1 });
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 bg-white/5 border border-white/10 p-6 rounded-3xl text-center">
                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{match.team1Name}</div>
                    <div className="text-6xl font-black text-white">{match.team1Score}</div>
                </div>
                <div className="text-center px-4">
                    <div className="text-xs font-black text-primary-400 uppercase tracking-tighter mb-1">Half</div>
                    <div className="text-4xl font-black text-white">{match.half || 1}</div>
                </div>
                <div className="flex-1 bg-white/5 border border-white/10 p-6 rounded-3xl text-center">
                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{match.team2Name}</div>
                    <div className="text-6xl font-black text-white">{match.team2Score}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Team 1 Controls */}
                <div className="space-y-2">
                    <button onClick={() => handleScore('team1Score', 'raid', 1)} className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-bold py-3 rounded-xl transition-all">Raid +1</button>
                    <button onClick={() => handleScore('team1Score', 'tackle', 1)} className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 font-bold py-3 rounded-xl transition-all">Tackle +1</button>
                    <button onClick={() => handleScore('team1Score', 'allout', 2)} className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-500 font-bold py-3 rounded-xl transition-all">ALL OUT +2</button>
                </div>

                {/* Team 2 Controls */}
                <div className="space-y-2">
                    <button onClick={() => handleScore('team2Score', 'raid', 1)} className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-bold py-3 rounded-xl transition-all">Raid +1</button>
                    <button onClick={() => handleScore('team2Score', 'tackle', 1)} className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 font-bold py-3 rounded-xl transition-all">Tackle +1</button>
                    <button onClick={() => handleScore('team2Score', 'allout', 2)} className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-500 font-bold py-3 rounded-xl transition-all">ALL OUT +2</button>
                </div>
            </div>

            <button onClick={toggleHalf} className="w-full py-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 font-bold transition-all">Switch Half / Break</button>
        </div>
    );
}
