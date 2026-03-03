import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function TennisScorer({ match }) {
    const points = [0, 15, 30, 40, 'Ad'];

    const handlePoint = async (teamKey) => {
        const matchRef = doc(db, 'matches', match.id);
        const otherTeamKey = teamKey === 'team1' ? 'team2' : 'team1';

        const currentPoints = match.currentPoints?.[teamKey] || 0;
        const otherPoints = match.currentPoints?.[otherTeamKey] || 0;

        // Advantage logic
        if (currentPoints === 40 && otherPoints === 40) {
            // Deuce to Advantage
            await updateDoc(matchRef, { [`currentPoints.${teamKey}`]: 'Ad' });
        } else if (currentPoints === 'Ad') {
            // Advantage to Game
            await winGame(teamKey);
        } else if (otherPoints === 'Ad') {
            // Other team had Ad, back to Deuce
            await updateDoc(matchRef, { [`currentPoints.${otherTeamKey}`]: 40 });
        } else if (currentPoints === 40) {
            // 40 to Game (not Deuce)
            await winGame(teamKey);
        } else {
            // Standard point progression
            const nextPoint = points[points.indexOf(currentPoints) + 1];
            await updateDoc(matchRef, { [`currentPoints.${teamKey}`]: nextPoint });
        }
    };

    const winGame = async (teamKey) => {
        const matchRef = doc(db, 'matches', match.id);
        const currentGames = match.games?.[teamKey] || 0;

        await updateDoc(matchRef, {
            [`games.${teamKey}`]: currentGames + 1,
            'currentPoints.team1': 0,
            'currentPoints.team2': 0
        });
    };

    const winSet = async (teamKey) => {
        if (!window.confirm("Confirm this set for the team?")) return;
        const matchRef = doc(db, 'matches', match.id);
        const currentSets = match.sets?.[teamKey] || 0;

        await updateDoc(matchRef, {
            [`sets.${teamKey}`]: currentSets + 1,
            'games.team1': 0,
            'games.team2': 0,
            'currentPoints.team1': 0,
            'currentPoints.team2': 0
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="text-center flex-1">
                    <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Sets Won</div>
                    <div className="text-2xl font-black text-white">{match.sets?.team1 || 0}</div>
                    <div className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mt-4">Games</div>
                    <div className="text-4xl font-black text-white mb-4">{match.games?.team1 || 0}</div>
                    <div className="text-xs font-bold text-gray-500 truncate mb-4">{match.team1Name}</div>
                    <div className="text-5xl font-black text-white mb-6 bg-white/5 py-3 rounded-2xl">{match.currentPoints?.team1 || 0}</div>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => handlePoint('team1')} className="btn-primary py-3">Point +</button>
                        <button onClick={() => winSet('team1')} className="bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-2 rounded-xl text-xs">Win Set</button>
                    </div>
                </div>

                <div className="px-4 flex flex-col items-center">
                    <div className="w-[1px] h-48 bg-white/10"></div>
                    <span className="py-4 text-xs font-black text-gray-700">VS</span>
                    <div className="w-[1px] h-48 bg-white/10"></div>
                </div>

                <div className="text-center flex-1">
                    <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Sets Won</div>
                    <div className="text-2xl font-black text-white">{match.sets?.team2 || 0}</div>
                    <div className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mt-4">Games</div>
                    <div className="text-4xl font-black text-white mb-4">{match.games?.team2 || 0}</div>
                    <div className="text-xs font-bold text-gray-500 truncate mb-4">{match.team2Name}</div>
                    <div className="text-5xl font-black text-white mb-6 bg-white/5 py-3 rounded-2xl">{match.currentPoints?.team2 || 0}</div>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => handlePoint('team2')} className="btn-primary py-3">Point +</button>
                        <button onClick={() => winSet('team2')} className="bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-2 rounded-xl text-xs">Win Set</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
