const MatchCard = ({ match, isLive = false }) => {
  const getStatusColor = (status) => {
    if (status === 'live') return 'bg-red-500 shadow-red-500/50';
    if (status === 'finished') return 'bg-green-500 shadow-green-500/50';
    return 'bg-yellow-500 shadow-yellow-500/50';
  };

  const formatScheduledTime = (time) => {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="card-arena group hover:border-primary-500/30 transition-all duration-300">
      {/* Accent glow based on status */}
      <div className={`absolute top-0 left-0 w-1.5 h-full opacity-100 ${getStatusColor(match.status)}`}></div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xl shadow-inner group-hover:bg-primary-500/10 group-hover:border-primary-500/30 transition-all">
            <span>🏟️</span>
          </div>
          <span className="font-sporty text-lg text-white italic tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity uppercase">{match.sportId}</span>
        </div>
        <div className="flex items-center">
          {isLive && match.status === 'live' && (
            <div className="flex items-center space-x-3 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,1)]"></div>
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest italic">Live</span>
            </div>
          )}
          {match.status !== 'live' && (
            <span className="badge-sporty py-1 px-4 !text-[8px] opacity-60">
              {match.status}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6 my-8">
        <div className="flex items-center justify-between bg-white/[0.02] p-6 rounded-2xl border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group/team">
          <div className="flex items-center space-x-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xs bg-black border border-white/10 shadow-2xl tracking-tighter italic">
              T1
            </div>
            <div>
              <div className="font-sporty text-2xl text-white group-hover/team:text-primary-500 transition-colors italic">{match.team1Name}</div>
              {match.sportId === 'volleyball' || match.sportId === 'badminton' || match.sportId === 'tabletennis' ? (
                <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] italic mt-1">Sets: {match.sets?.team1 || 0}</div>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-sporty text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] italic">
              {match.sportId === 'volleyball' || match.sportId === 'badminton' || match.sportId === 'tabletennis'
                ? match.currentSetPoints?.team1 || 0
                : match.team1Score}
            </div>
            {match.sportId === 'cricket' && match.status === 'live' && (
              <div className="text-[10px] font-black text-gray-500 text-right uppercase tracking-widest italic mt-2">
                {match.innings === 1 && `W: ${match.wickets || 0} • O: ${match.currentOver || 0}.${match.ballsInOver?.filter(b => b !== 'Wd' && b !== 'Nb').length || 0}`}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center relative h-6">
          <div className="w-full h-px bg-white/5 absolute top-1/2 -translate-y-1/2"></div>
          <div className="px-5 py-1.5 rounded-full bg-black border border-white/10 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] absolute z-10 italic shadow-xl">
            {match.sportId === 'basketball' && `Q${match.quarter || 1}`}
            {['football', 'hockey', 'kabaddi'].includes(match.sportId) && `HALF ${match.half || 1}`}
            {match.sportId === 'cricket' && `INN. ${match.innings || 1}`}
            {!(['basketball', 'football', 'hockey', 'kabaddi', 'cricket'].includes(match.sportId)) && 'VS'}
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/[0.02] p-6 rounded-2xl border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group/team">
          <div className="flex items-center space-x-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xs bg-black border border-white/10 shadow-2xl tracking-tighter italic">
              T2
            </div>
            <div>
              <div className="font-sporty text-2xl text-white group-hover/team:text-primary-500 transition-colors italic">{match.team2Name}</div>
              {match.sportId === 'volleyball' || match.sportId === 'badminton' || match.sportId === 'tabletennis' ? (
                <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] italic mt-1">Sets: {match.sets?.team2 || 0}</div>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-sporty text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] italic">
              {match.sportId === 'volleyball' || match.sportId === 'badminton' || match.sportId === 'tabletennis'
                ? match.currentSetPoints?.team2 || 0
                : match.team2Score}
            </div>
            {match.sportId === 'cricket' && match.status === 'live' && (
              <div className="text-[10px] font-black text-gray-500 text-right uppercase tracking-widest italic mt-2">
                {match.innings === 2 && `W: ${match.wickets || 0} • O: ${match.currentOver || 0}.${match.ballsInOver?.filter(b => b !== 'Wd' && b !== 'Nb').length || 0}`}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-400 font-black italic text-[10px] tracking-widest uppercase">
            <span className="mr-2 opacity-60 text-base">📍</span> {match.venue || 'Main Arena'}
          </div>
          {match.status === 'upcoming' && match.scheduledStartTime && (
            <div className="flex items-center text-primary-500 font-black text-[10px] uppercase tracking-[0.2em] bg-primary-500/5 px-4 py-2 rounded-lg border border-primary-500/20 italic">
              <span className="mr-2 text-xs">⏰</span> {formatScheduledTime(match.scheduledStartTime)}
            </div>
          )}
        </div>

        {match.winnerId && match.status === 'finished' && (
          <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center space-x-3 backdrop-blur-sm group-hover:bg-primary-500/20 transition-all duration-500 shadow-xl shadow-primary-500/5">
            <span className="text-xl">🏆</span>
            <span className="text-xs font-sporty text-primary-500 tracking-widest italic">
              VICTOR: {match.winnerId === match.team1Id ? match.team1Name : match.winnerId === match.team2Id ? match.team2Name : 'DRAW'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
