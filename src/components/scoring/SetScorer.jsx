import React from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function SetScorer({ match }) {
    const handlePoint = async (teamKey) => {
        const matchRef = doc(db, 'matches', match.id);
        const currentPoints = match.currentSetPoints?.[teamKey] || 0;

        // Snapshot for Undo
        const snapshot = {
            sets: { ...match.sets },
            currentSetPoints: { ...match.currentSetPoints }
        };

        try {
            await updateDoc(matchRef, {
                [`currentSetPoints.${teamKey}`]: currentPoints + 1,
                history: arrayUnion(snapshot)
            });
        } catch (err) { console.error(err); }
    };

    const winSet = async (teamKey) => {
        if (!window.confirm("Confirm this set for the team?")) return;

        const matchRef = doc(db, 'matches', match.id);
        const currentSets = match.sets?.[teamKey] || 0;

        // Snapshot for Undo
        const snapshot = {
            sets: { ...match.sets },
            currentSetPoints: { ...match.currentSetPoints }
        };

        try {
            await updateDoc(matchRef, {
                [`sets.${teamKey}`]: currentSets + 1,
                'currentSetPoints.team1': 0,
                'currentSetPoints.team2': 0,
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

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-black/40 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="text-center flex-1 relative z-10">
                    <div className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-2">Sets Won</div>
                    <div className="text-5xl font-black text-white mb-6 drop-shadow-lg">{match.sets?.team1 || 0}</div>
                    <div className="text-xs font-bold text-gray-400 truncate mb-4 uppercase tracking-widest">{match.team1Name}</div>
                    <div className="text-7xl font-black text-white mb-8 transition-transform group-hover:scale-110 duration-500">{match.currentSetPoints?.team1 || 0}</div>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => handlePoint('team1')} className="bg-primary-600 hover:bg-primary-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary-500/20 px-6 transition-all active:scale-95 uppercase tracking-widest text-[10px]">Point +1</button>
                        <button onClick={() => winSet('team1')} className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 font-black py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all">Win Set</button>
                    </div>
                </div>

                <div className="px-10 flex flex-col items-center relative z-10">
                    <div className="w-[1px] h-48 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                    {match.history?.length > 0 && (
                        <button onClick={handleUndo} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gray-900 border border-white/10 text-white flex items-center justify-center text-lg hover:bg-gray-800 transition-all active:scale-90 shadow-2xl">
                            ↩️
                        </button>
                    )}
                </div>

                <div className="text-center flex-1 relative z-10">
                    <div className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-2">Sets Won</div>
                    <div className="text-5xl font-black text-white mb-6 drop-shadow-lg">{match.sets?.team2 || 0}</div>
                    <div className="text-xs font-bold text-gray-400 truncate mb-4 uppercase tracking-widest">{match.team2Name}</div>
                    <div className="text-7xl font-black text-white mb-8 transition-transform group-hover:scale-110 duration-500">{match.currentSetPoints?.team2 || 0}</div>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => handlePoint('team2')} className="bg-primary-600 hover:bg-primary-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary-500/20 px-6 transition-all active:scale-95 uppercase tracking-widest text-[10px]">Point +1</button>
                        <button onClick={() => winSet('team2')} className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 font-black py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all">Win Set</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
