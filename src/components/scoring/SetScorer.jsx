import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { sportRules } from '../../data/sportRules';

export default function SetScorer({ match }) {
    const sportInfo = sportRules[match.sportId] || {};

    const handlePoint = async (teamKey) => {
        const matchRef = doc(db, 'matches', match.id);
        const currentPoints = match.currentSetPoints?.[teamKey] || 0;

        try {
            await updateDoc(matchRef, {
                [`currentSetPoints.${teamKey}`]: currentPoints + 1
            });
        } catch (err) { console.error(err); }
    };

    const winSet = async (teamKey) => {
        if (!window.confirm("Confirm this set for the team?")) return;

        const matchRef = doc(db, 'matches', match.id);
        const currentSets = match.sets?.[teamKey] || 0;

        try {
            await updateDoc(matchRef, {
                [`sets.${teamKey}`]: currentSets + 1,
                'currentSetPoints.team1': 0,
                'currentSetPoints.team2': 0
            });
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-4">
            <div className="bg-primary-500/10 border border-primary-500/20 p-3 rounded-2xl text-center">
                <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest italic">
                    {match.sportId === 'volleyball' && "Sets to 25 • Best of 3/5"}
                    {match.sportId === 'badminton' && "Sets to 21 • Best of 3"}
                    {match.sportId === 'tabletennis' && "Sets to 11 • Best of 5/7"}
                </p>
            </div>

            <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="text-center flex-1">
                    <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Sets Won</div>
                    <div className="text-4xl font-black text-white mb-4">{match.sets?.team1 || 0}</div>
                    <div className="text-xs font-bold text-gray-400 truncate mb-4">{match.team1Name}</div>
                    <div className="text-6xl font-black text-white mb-6 bg-white/5 py-4 rounded-2xl shadow-inner">{match.currentSetPoints?.team1 || 0}</div>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => handlePoint('team1')} className="btn-primary py-3 active:scale-95 transition-all">Point +1</button>
                        <button onClick={() => winSet('team1')} className="bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-2 rounded-xl text-xs hover:bg-green-500/30 transition-all">Win Set</button>
                    </div>
                </div>

                <div className="px-6 flex flex-col items-center">
                    <div className="w-[1px] h-32 bg-white/10"></div>
                    <span className="py-4 text-[10px] font-black text-gray-700">SCR</span>
                    <div className="w-[1px] h-32 bg-white/10"></div>
                </div>

                <div className="text-center flex-1">
                    <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Sets Won</div>
                    <div className="text-4xl font-black text-white mb-4">{match.sets?.team2 || 0}</div>
                    <div className="text-xs font-bold text-gray-400 truncate mb-4">{match.team2Name}</div>
                    <div className="text-6xl font-black text-white mb-6 bg-white/5 py-4 rounded-2xl shadow-inner">{match.currentSetPoints?.team2 || 0}</div>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => handlePoint('team2')} className="btn-primary py-3 active:scale-95 transition-all">Point +1</button>
                        <button onClick={() => winSet('team2')} className="bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-2 rounded-xl text-xs hover:bg-green-500/30 transition-all">Win Set</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
