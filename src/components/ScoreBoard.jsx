import MatchCard from './MatchCard.jsx';

const ScoreBoard = ({ title, matches, isLive = false }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-400">
          <span className="text-4xl block mb-2">🏏</span>
          <p>No matches available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {isLive && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
            <span className="text-sm font-medium text-red-400">Live Updates</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <div key={match.id} className="transform transition-transform hover:scale-[1.02]">
            <MatchCard match={match} isLive={isLive} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBoard;
