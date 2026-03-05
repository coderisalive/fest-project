import { colleges, sports } from './mockData.js';

const originalLiveMatches = [
  {
    id: 1,
    sport: sports[0], // Cricket
    team1: colleges[0],
    team2: colleges[1],
    score1: { runs: 145, wickets: 3, overs: 18.2 },
    score2: { runs: 98, wickets: 2, overs: 12.4 },
    status: "Live - 2nd Innings",
    venue: "Main Ground",
    startTime: "10:00 AM"
  },
  {
    id: 2,
    sport: sports[1], // Football
    team1: colleges[2],
    team2: colleges[3],
    score1: { goals: 2 },
    score2: { goals: 1 },
    status: "Live - 2nd Half",
    venue: "Football Field",
    startTime: "11:30 AM"
  },
  {
    id: 3,
    sport: sports[2], // Carrom
    team1: colleges[4],
    team2: colleges[5],
    score1: { points: 28 },
    score2: { points: 25 },
    status: "Live - Board 2",
    venue: "Indoor Hall",
    startTime: "9:00 AM"
  }
];

const originalMatchResults = [
  {
    id: 101,
    sport: sports[0],
    team1: colleges[0],
    team2: colleges[2],
    score1: { runs: 180, wickets: 8, overs: 20 },
    score2: { runs: 165, wickets: 10, overs: 19.4 },
    winner: colleges[0],
    date: "2026-02-27",
    status: "Completed"
  },
  {
    id: 102,
    sport: sports[1],
    team1: colleges[1],
    team2: colleges[3],
    score1: { goals: 3 },
    score2: { goals: 1 },
    winner: colleges[1],
    date: "2026-02-27",
    status: "Completed"
  },
  {
    id: 103,
    sport: sports[2],
    team1: colleges[4],
    team2: colleges[5],
    score1: { points: 35 },
    score2: { points: 32 },
    winner: colleges[4],
    date: "2026-02-26",
    status: "Completed"
  }
];

const originalSportPointsTables = {
  cricket: [
    {
      position: 1,
      college: colleges[0],
      played: 5,
      won: 4,
      lost: 1,
      points: 16,
      nrr: "+2.45"
    },
    {
      position: 2,
      college: colleges[1],
      played: 5,
      won: 3,
      lost: 2,
      points: 12,
      nrr: "+1.82"
    },
    {
      position: 3,
      college: colleges[2],
      played: 5,
      won: 2,
      lost: 3,
      points: 8,
      nrr: "+0.56"
    },
    {
      position: 4,
      college: colleges[3],
      played: 5,
      won: 2,
      lost: 3,
      points: 8,
      nrr: "-0.23"
    },
    {
      position: 5,
      college: colleges[4],
      played: 5,
      won: 1,
      lost: 4,
      points: 4,
      nrr: "-1.15"
    },
    {
      position: 6,
      college: colleges[5],
      played: 5,
      won: 1,
      lost: 4,
      points: 4,
      nrr: "-2.89"
    }
  ],
  football: [
    {
      position: 1,
      college: colleges[1],
      played: 5,
      won: 4,
      lost: 1,
      points: 12,
      gf: 12,
      ga: 4
    },
    {
      position: 2,
      college: colleges[2],
      played: 5,
      won: 3,
      lost: 2,
      points: 9,
      gf: 8,
      ga: 6
    },
    {
      position: 3,
      college: colleges[0],
      played: 5,
      won: 3,
      lost: 2,
      points: 9,
      gf: 7,
      ga: 5
    },
    {
      position: 4,
      college: colleges[3],
      played: 5,
      won: 2,
      lost: 3,
      points: 6,
      gf: 6,
      ga: 8
    },
    {
      position: 5,
      college: colleges[4],
      played: 5,
      won: 1,
      lost: 4,
      points: 3,
      gf: 4,
      ga: 10
    },
    {
      position: 6,
      college: colleges[5],
      played: 5,
      won: 0,
      lost: 5,
      points: 0,
      gf: 2,
      ga: 12
    }
  ],
  carrom: [
    {
      position: 1,
      college: colleges[4],
      played: 5,
      won: 4,
      lost: 1,
      points: 20,
      sp: "+15"
    },
    {
      position: 2,
      college: colleges[0],
      played: 5,
      won: 3,
      lost: 2,
      points: 15,
      sp: "+8"
    },
    {
      position: 3,
      college: colleges[2],
      played: 5,
      won: 3,
      lost: 2,
      points: 15,
      sp: "+5"
    },
    {
      position: 4,
      college: colleges[1],
      played: 5,
      won: 2,
      lost: 3,
      points: 10,
      sp: "-2"
    },
    {
      position: 5,
      college: colleges[3],
      played: 5,
      won: 1,
      lost: 4,
      points: 5,
      sp: "-8"
    },
    {
      position: 6,
      college: colleges[5],
      played: 5,
      won: 1,
      lost: 4,
      points: 5,
      sp: "-12"
    }
  ],
  basketball: [
    {
      position: 1,
      college: colleges[2],
      played: 4,
      won: 3,
      lost: 1,
      points: 9,
      diff: "+25"
    },
    {
      position: 2,
      college: colleges[0],
      played: 4,
      won: 3,
      lost: 1,
      points: 9,
      diff: "+18"
    },
    {
      position: 3,
      college: colleges[3],
      played: 4,
      won: 2,
      lost: 2,
      points: 6,
      diff: "+5"
    },
    {
      position: 4,
      college: colleges[1],
      played: 4,
      won: 2,
      lost: 2,
      points: 6,
      diff: "-3"
    },
    {
      position: 5,
      college: colleges[4],
      played: 4,
      won: 1,
      lost: 3,
      points: 3,
      diff: "-15"
    },
    {
      position: 6,
      college: colleges[5],
      played: 4,
      won: 0,
      lost: 4,
      points: 0,
      diff: "-30"
    }
  ],
  volleyball: [
    {
      position: 1,
      college: colleges[3],
      played: 4,
      won: 4,
      lost: 0,
      points: 12,
      sp: "+8"
    },
    {
      position: 2,
      college: colleges[1],
      played: 4,
      won: 3,
      lost: 1,
      points: 9,
      sp: "+5"
    },
    {
      position: 3,
      college: colleges[0],
      played: 4,
      won: 2,
      lost: 2,
      points: 6,
      sp: "+2"
    },
    {
      position: 4,
      college: colleges[2],
      played: 4,
      won: 2,
      lost: 2,
      points: 6,
      sp: "-1"
    },
    {
      position: 5,
      college: colleges[4],
      played: 4,
      won: 1,
      lost: 3,
      points: 3,
      sp: "-4"
    },
    {
      position: 6,
      college: colleges[5],
      played: 4,
      won: 0,
      lost: 4,
      points: 0,
      sp: "-10"
    }
  ],
  lawntennis: [
    {
      position: 1,
      college: colleges[0],
      played: 5,
      won: 4,
      lost: 1,
      points: 8
    },
    {
      position: 2,
      college: colleges[2],
      played: 5,
      won: 3,
      lost: 2,
      points: 6
    },
    {
      position: 3,
      college: colleges[1],
      played: 5,
      won: 3,
      lost: 2,
      points: 6
    },
    {
      position: 4,
      college: colleges[3],
      played: 5,
      won: 2,
      lost: 3,
      points: 4
    },
    {
      position: 5,
      college: colleges[4],
      played: 5,
      won: 2,
      lost: 3,
      points: 4
    },
    {
      position: 6,
      college: colleges[5],
      played: 5,
      won: 1,
      lost: 4,
      points: 2
    }
  ],
  badminton: [
    {
      position: 1,
      college: colleges[1],
      played: 6,
      won: 5,
      lost: 1,
      points: 10
    },
    {
      position: 2,
      college: colleges[3],
      played: 6,
      won: 4,
      lost: 2,
      points: 8
    },
    {
      position: 3,
      college: colleges[0],
      played: 6,
      won: 4,
      lost: 2,
      points: 8
    },
    {
      position: 4,
      college: colleges[2],
      played: 6,
      won: 3,
      lost: 3,
      points: 6
    },
    {
      position: 5,
      college: colleges[4],
      played: 6,
      won: 2,
      lost: 4,
      points: 4
    },
    {
      position: 6,
      college: colleges[5],
      played: 6,
      won: 1,
      lost: 5,
      points: 2
    }
  ],
  tableTennis: [
    {
      position: 1,
      college: colleges[2],
      played: 6,
      won: 5,
      lost: 1,
      points: 10
    },
    {
      position: 2,
      college: colleges[0],
      played: 6,
      won: 4,
      lost: 2,
      points: 8
    },
    {
      position: 3,
      college: colleges[4],
      played: 6,
      won: 4,
      lost: 2,
      points: 8
    },
    {
      position: 4,
      college: colleges[1],
      played: 6,
      won: 3,
      lost: 3,
      points: 6
    },
    {
      position: 5,
      college: colleges[3],
      played: 6,
      won: 2,
      lost: 4,
      points: 4
    },
    {
      position: 6,
      college: colleges[5],
      played: 6,
      won: 1,
      lost: 5,
      points: 2
    }
  ]
};

export const liveMatches = originalLiveMatches.map((m, i) => ({ ...m, gender: i % 2 === 0 ? "Boys" : "Girls" }));
export const matchResults = originalMatchResults.map((m, i) => ({ ...m, gender: i % 2 === 0 ? "Girls" : "Boys" }));
export const sportPointsTables = {};
Object.keys(originalSportPointsTables).forEach(key => {
  sportPointsTables[key + '_boys'] = originalSportPointsTables[key].map(team => ({ ...team }));
  sportPointsTables[key + '_girls'] = [...originalSportPointsTables[key]].reverse().map((team, i) => ({
    ...team,
    position: i + 1,
    // Swap points/won/lost slightly to make it look different from boys
    points: originalSportPointsTables[key][i].points,
    won: originalSportPointsTables[key][i].won,
    lost: originalSportPointsTables[key][i].lost
  }));
});
