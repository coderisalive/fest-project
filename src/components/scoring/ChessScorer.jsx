import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function ChessScorer({ match }) {
    const handleResult = async (result) => {
        const matchRef = doc(db, 'matches', match.id);

        let t1Score = 0;
        let t2Score = 0;
        let winner = null;

        if (result === 't1') {
            t1Score = 1;
            t2Score = 0;
            winner = match.team1Id;
        } else if (result === 't2') {
            t1Score = 0;
            t2Score = 1;
            winner = match.team2Id;
        } else if (result === 'draw') {
            t1Score = 0.5;
            t2Score = 0.5;
            winner = 'draw';
        }

        if (!window.confirm(`Confirm result: ${result === 'draw' ? 'DRAW' : result === 't1' ? match.team1Name : match.team2Name}?`)) return;

        try {
            await updateDoc(matchRef, {
                team1Score: t1Score,
                team2Score: t2Score,
                // In Chess, result usually ends the match or game
                // We'll just update scores, the scorer can "Finalize" using the dashboard button
            });
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="text-center space-y-4">
                    <div className="text-xs font-bold text-gray-400 capitalize">{match.team1Name}</div>
                    <div className="text-5xl font-black text-white">{match.team1Score}</div>
                    <button
                        onClick={() => handleResult('t1')}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/20"
                    >
                        Won (1.0)
                    </button>
                </div>
                <div className="text-center space-y-4">
                    <div className="text-xs font-bold text-gray-400 capitalize">{match.team2Name}</div>
                    <div className="text-5xl font-black text-white">{match.team2Score}</div>
                    <button
                        onClick={() => handleResult('t2')}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/20"
                    >
                        Won (1.0)
                    </button>
                </div>
            </div>
            <button
                onClick={() => handleResult('draw')}
                className="w-full btn-secondary py-4 text-lg"
            >
                🤝 Declare Draw (0.5 - 0.5)
            </button>
        </div>
    );
}
