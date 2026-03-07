import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function CricketScorer({ match }) {
    const [nbSelection, setNbSelection] = useState(false);

    const handleBall = async (outcome, extraRuns = 0) => {
        const matchRef = doc(db, 'matches', match.id);

        let runsToAdd = 0;
        let wicketToAdd = 0;
        let isLegalDelivery = true;
        let displayOutcome = outcome;
        let extraType = null;

        if (typeof outcome === 'number') {
            runsToAdd = outcome;
        } else if (outcome === 'W') {
            wicketToAdd = 1;
            displayOutcome = 'W';
        } else if (outcome === 'Wd') {
            runsToAdd = 1;
            isLegalDelivery = false;
            displayOutcome = 'Wd';
            extraType = 'wide';
        } else if (outcome === 'Nb') {
            runsToAdd = 1 + extraRuns;
            isLegalDelivery = false;
            displayOutcome = extraRuns > 0 ? `${extraRuns}Nb` : 'Nb';
            extraType = 'noball';
            setNbSelection(false); // Close selection menu
        } else if (outcome === 'B') {
            runsToAdd = 1; // Simplification: assume 1 bye for now
            displayOutcome = 'B';
            extraType = 'bye';
        } else if (outcome === 'Lb') {
            runsToAdd = 1;
            displayOutcome = 'Lb';
            extraType = 'legbye';
        }

        const teamKey = match.innings === 1 ? 'team1Score' : 'team2Score';
        const currentScore = match[teamKey] || 0;
        const currentWickets = match.wickets || 0;
        const currentOver = match.currentOver || 0;
        const ballsInOver = match.ballsInOver || [];

        // History for Undo
        const snapshot = {
            [teamKey]: currentScore,
            wickets: currentWickets,
            currentOver,
            ballsInOver: [...ballsInOver],
            currentBall: match.currentBall || 0
        };

        const newBallsInOver = [...ballsInOver, displayOutcome];
        const legalBallsCount = newBallsInOver.filter(b => typeof b === 'number' || b === 'W' || b === 'B' || b === 'Lb').length;

        const updates = {
            [teamKey]: currentScore + runsToAdd,
            wickets: currentWickets + wicketToAdd,
            ballsInOver: newBallsInOver,
            history: arrayUnion(snapshot)
        };

        if (isLegalDelivery && legalBallsCount === 6) {
            updates.currentOver = currentOver + 1;
            updates.ballsInOver = [];
            updates.currentBall = 0;
        }

        try {
            await updateDoc(matchRef, updates);
        } catch (err) {
            console.error("Cricket update failed:", err);
        }
    };

    const handleUndo = async () => {
        if (!match.history || match.history.length === 0) return;

        const lastState = match.history[match.history.length - 1];
        const newHistory = match.history.slice(0, -1);

        try {
            const matchRef = doc(db, 'matches', match.id);
            await updateDoc(matchRef, {
                ...lastState,
                history: newHistory
            });
        } catch (err) {
            console.error("Undo failed:", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">{match.innings === 1 ? '1st' : '2nd'} Innings</div>
                    <div className="text-5xl font-black text-white">{match.innings === 1 ? match.team1Score : match.team2Score} - <span className="text-red-500">{match.wickets}</span></div>
                    {match.innings === 2 && match.target > 0 && (
                        <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest mt-1 bg-primary-500/10 px-2 py-0.5 rounded-full inline-block border border-primary-500/20">
                            Target: {match.target} • Need {match.target - (match.innings === 1 ? match.team1Score : match.team2Score)}
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Overs</div>
                    <div className="text-3xl font-bold text-white">{match.currentOver}.{match.ballsInOver?.filter(b => typeof b === 'number' || b === 'W' || b === 'B' || b === 'Lb').length}</div>
                </div>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 min-h-[60px] flex items-center gap-3 overflow-x-auto hide-scrollbar border border-white/5 relative">
                {match.ballsInOver?.length === 0 ? (
                    <span className="text-gray-600 font-medium italic">Ready for new over...</span>
                ) : (
                    match.ballsInOver?.map((ball, i) => (
                        <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 border shadow-lg ${ball === 'W' ? 'bg-red-500 border-red-400 text-white' :
                            ball.toString().includes('Wd') || ball.toString().includes('Nb') ? 'bg-yellow-500 border-yellow-400 text-black' :
                                ball === 'B' || ball === 'Lb' ? 'bg-purple-500 border-purple-400 text-white' :
                                    ball === 4 || ball === 6 ? 'bg-primary-600 border-primary-500 text-white animate-pulse' :
                                        'bg-white/10 border-white/10 text-gray-300'
                            }`}>
                            {ball}
                        </div>
                    ))
                )}
                {match.history?.length > 0 && (
                    <button
                        onClick={handleUndo}
                        className="sticky right-0 ml-auto bg-gray-800 hover:bg-gray-700 text-gray-300 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 shadow-xl transition-all active:scale-90"
                        title="Undo Last Ball"
                    >
                        ↩️
                    </button>
                )}
            </div>

            {nbSelection ? (
                <div className="bg-yellow-500/5 rounded-2xl p-6 border border-yellow-500/10 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-yellow-500 font-black text-xs tracking-widest uppercase italic">Select Runs on No-Ball</span>
                        <button onClick={() => setNbSelection(false)} className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest">Cancel</button>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                        {[0, 1, 2, 3, 4, 6].map(run => (
                            <button key={run} onClick={() => handleBall('Nb', run)} className="bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/20 text-yellow-500 font-black py-4 rounded-xl transition-all active:scale-95">
                                {run}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3, 4, 6].map(run => (
                        <button key={run} onClick={() => handleBall(run)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg group">
                            <span className="group-hover:scale-110 transition-transform block">{run}</span>
                        </button>
                    ))}
                    <button onClick={() => handleBall('Wd')} className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-500 font-black py-4 rounded-xl transition-all active:scale-95 text-xs">WD</button>
                    <button onClick={() => setNbSelection(true)} className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-500 font-black py-4 rounded-xl transition-all active:scale-95 text-xs ring-2 ring-yellow-500/20">NB+</button>

                    <button onClick={() => handleBall('B')} className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 font-black py-4 rounded-xl transition-all active:scale-95 text-xs">BYE</button>
                    <button onClick={() => handleBall('Lb')} className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 font-black py-4 rounded-xl transition-all active:scale-95 text-xs">LBYE</button>

                    <button onClick={() => handleBall('W')} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-black py-4 rounded-xl col-span-2 transition-all active:scale-95 group">
                        <span className="group-hover:tracking-widest transition-all">WICKET</span>
                    </button>

                    <button onClick={async () => {
                        if (window.confirm("End this innings? Score will be saved as target for 2nd innings.")) {
                            const finalScore = match.innings === 1 ? match.team1Score : match.team2Score;
                            await updateDoc(doc(db, 'matches', match.id), {
                                innings: match.innings === 1 ? 2 : 1,
                                wickets: 0,
                                currentOver: 0,
                                ballsInOver: [],
                                target: match.innings === 1 ? finalScore + 1 : 0,
                                history: []
                            });
                        }
                    }} className="bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 text-primary-400 font-black py-4 rounded-xl col-span-2 transition-all text-xs uppercase tracking-widest">Next Innings</button>
                </div>
            )}
        </div>
    );
}
