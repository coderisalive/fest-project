const PointsTable = ({ sport, pointsData }) => {
  if (!pointsData || pointsData.length === 0) {
    return (
      <div className="glass-card">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="mr-3">🏆</span> Leaderboard
        </h3>
        <div className="text-center py-16 text-gray-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
          <span className="text-5xl block mb-4 opacity-50">📊</span>
          <p className="text-lg font-medium">No standings available yet.</p>
        </div>
      </div>
    );
  }

  const getPositionBadge = (position) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 border-0';
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg shadow-gray-400/30 border-0';
      case 3:
        return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 border-0';
      default:
        return 'bg-white/10 text-gray-300 border border-white/10';
    }
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return position;
    }
  };

  const getTableColumns = () => {
    // Standardize columns for all sports as per user request
    const standardHeaders = ['Pos', 'College', 'Matches', 'Win', 'Loss', 'Draw', 'Points', 'Run Rate'];
    const standardKeys = ['position', 'college', 'matchesPlayed', 'won', 'lost', 'drawn', 'points', 'nrr'];
    const standardFooter = 'Matches: Played | Win: Won | Loss: Lost | Draw: Drawn | Points: Total Points | Run Rate: Performance Rate';

    switch (sport?.name.toLowerCase()) {
      case 'athletics':
        return {
          headers: ['Pos', 'College', 'Gold', 'Silver', 'Bronze', 'Total', 'Points'],
          keys: ['position', 'college', 'gold', 'silver', 'bronze', 'total', 'points'],
          footer: 'G: Gold | S: Silver | B: Bronze | T: Total Medals | Pts: Points'
        };
      default:
        return {
          headers: standardHeaders,
          keys: standardKeys,
          footer: standardFooter
        };
    }
  };

  const { headers, keys, footer } = getTableColumns();

  const renderCellValue = (row, key) => {
    if (key === 'college') {
      return (
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm border border-white/10 shadow-inner bg-gradient-to-br from-indigo-500/50 to-purple-500/50">
            {row.college}
          </div>
          <div>
            <div className="text-base font-bold text-gray-100 tracking-wide">{row.name}</div>
          </div>
        </div>
      );
    }

    if (key === 'position') {
      return (
        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-bold ${getPositionBadge(row[key])}`}>
          {getPositionIcon(row[key])}
        </div>
      );
    }

    if (key === 'points') {
      return (
        <span className="inline-flex items-center px-4 py-1 rounded-full text-base font-black bg-primary-500/20 text-primary-300 border border-primary-500/30 shadow-inner">
          {row[key]}
        </span>
      );
    }

    return <span className="font-semibold text-gray-300">{row[key] || '-'}</span>;
  };

  return (
    <div className="glass overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
      <div className="px-8 py-6 relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold flex items-center text-white drop-shadow-md">
              <span className="mr-4 text-4xl p-2 bg-white/10 rounded-2xl border border-white/10 shadow-inner">{sport?.icon}</span>
              {sport?.name} <span className="ml-3 text-sm px-3 py-1 bg-white/10 rounded-full border border-white/10 text-primary-300 font-black uppercase tracking-widest">{sport?.gender || 'Men'}</span> Standings
            </h2>
            <p className="text-gray-300 text-sm mt-2 font-medium uppercase tracking-tighter">PRAKRIDA 2026 Official Leaderboard</p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-white/10 rounded-full border border-white/10 text-sm font-bold text-primary-300 shadow-inner w-max">
            LIVE UPDATE
          </div>
        </div>
      </div>

      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="bg-black/20 border-b border-white/5">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest ${header === 'College' ? 'text-left' : 'text-center'}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pointsData.map((row, index) => (
              <tr key={row.id} className="hover:bg-white/5 transition-colors duration-200 group">
                {keys.map((key, colIndex) => {
                  const displayRow = { ...row, position: index + 1 };
                  return (
                    <td
                      key={colIndex}
                      className={`px-8 py-5 whitespace-nowrap ${key === 'college' ? '' : 'text-center'} group-hover:scale-[1.01] transition-transform`}
                    >
                      {renderCellValue(displayRow, key)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-5 bg-black/20 border-t border-white/5 text-xs text-gray-400 font-medium tracking-wide">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="opacity-70">{footer}</span>
          <span className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>Synced instantly via secure real-time listener</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PointsTable;
