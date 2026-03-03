import React from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function CricketScorer({ match }) {
    const handleBall = async (outcome) => {
        const matchRef = doc(db, 'matches', match.id);

        let runsToAdd = 0;
        let wicketToAdd = 0;
        let isLegalDelivery = true;
        let displayOutcome = outcome;

        if (typeof outcome === 'number') {
            runsToAdd = outcome;
        } else if (outcome === 'W') {
            wicketToAdd = 1;
            displayOutcome = 'W';
        } else if (outcome === 'Wd') {
            runsToAdd = 1;
            isLegalDelivery = false;
            displayOutcome = 'Wd';
        } else if (outcome === 'Nb') {
            runsToAdd = 1;
            isLegalDelivery = false;
            displayOutcome = 'Nb';
        }

        const teamKey = match.innings === 1 ? 'team1Score' : 'team2Score';
        const currentScore = match[teamKey] || 0;
        const currentWickets = match.wickets || 0;
        const currentOver = match.currentOver || 0;
        const ballsInOver = match.ballsInOver || [];

        const newBallsInOver = [...ballsInOver, displayOutcome];
        const legalBallsCount = newBallsInOver.filter(b => b !== 'Wd' && b !== 'Nb').length;

        const updates = {
            [teamKey]: currentScore + runsToAdd,
            wickets: currentWickets + wicketToAdd,
            ballsInOver: newBallsInOver
        };

        if (isLegalDelivery && legalBallsCount === 6) {
            // Over finished
            updates.currentOver = currentOver + 1;
            updates.ballsInOver = []; // Clear current over balls as requested
            updates.currentBall = 0;
            alert(`Over ${currentOver + 1} completed!`);
        }

        try {
            await updateDoc(matchRef, updates);
        } catch (err) {
            console.error("Cricket update failed:", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Innings {match.innings}</div>
                    <div className="text-5xl font-black text-white">{match.innings === 1 ? match.team1Score : match.team2Score} - {match.wickets}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Overs</div>
                    <div className="text-3xl font-bold text-white">{match.currentOver}.{match.ballsInOver?.filter(b => b !== 'Wd' && b !== 'Nb').length}</div>
                </div>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 min-h-[60px] flex items-center gap-3 overflow-x-auto hide-scrollbar border border-white/5">
                {match.ballsInOver?.length === 0 ? (
                    <span className="text-gray-600 font-medium italic">Ready for new over...</span>
                ) : (
                    match.ballsInOver?.map((ball, i) => (
                        <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 border ${ball === 'W' ? 'bg-red-500 border-red-400 text-white' :
                                ball === 'Wd' || ball === 'Nb' ? 'bg-yellow-500 border-yellow-400 text-black' :
                                    ball === 4 || ball === 6 ? 'bg-primary-600 border-primary-500 text-white' :
                                        'bg-white/10 border-white/10 text-gray-300'
                            }`}>
                            {ball}
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3, 4, 6].map(run => (
                    <button key={run} onClick={() => handleBall(run)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-4 rounded-xl transition-all active:scale-95">
                        {run}
                    </button>
                ))}
                <button onClick={() => handleBall('Wd')} className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-500 font-black py-4 rounded-xl transition-all active:scale-95">Wd</button>
                <button onClick={() => handleBall('Nb')} className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-500 font-black py-4 rounded-xl transition-all active:scale-95">Nb</button>
                <button onClick={() => handleBall('W')} className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-500 font-black py-4 rounded-xl col-span-2 transition-all active:scale-95">WICKET</button>
                <button onClick={async () => {
                    if (window.confirm("Switch innings?")) {
                        await updateDoc(doc(db, 'matches', match.id), {
                            innings: match.innings === 1 ? 2 : 1,
                            wickets: 0,
                            currentOver: 0,
                            ballsInOver: []
                        });
                    }
                }} className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-black py-4 rounded-xl col-span-2 transition-all">Next Innings</button>
            </div>
        </div>
    );
}
