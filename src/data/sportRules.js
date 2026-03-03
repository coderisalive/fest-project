export const sportRules = {
    volleyball: {
        name: "Volleyball",
        rules: [
            "Matches are played as best-of-3 or best-of-5 sets.",
            "Sets are played to 25 points (deciding set to 15).",
            "Must win by at least 2 points.",
            "Points are scored on every rally (rally scoring)."
        ],
        scoringType: "set"
    },
    cricket: {
        name: "Cricket",
        rules: [
            "Format: Limited Overs (T20 or as specified).",
            "Standard ICC rules apply for Wide, No Ball, and Wickets.",
            "Over consists of 6 legal deliveries.",
            "Wide/No Ball adds 1 run and ball must be re-bowled."
        ],
        scoringType: "cricket"
    },
    basketball: {
        name: "Basketball",
        rules: [
            "Matches consist of 4 quarters.",
            "Points: 1 (Free Throw), 2 (Inside Arc), 3 (Outside Arc).",
            "Standard FIBA rules apply.",
            "Overtime played if scores are level after 4 quarters."
        ],
        scoringType: "basketball"
    },
    tabletennis: {
        name: "Table Tennis",
        rules: [
            "Matches are best-of-5 or best-of-7 games.",
            "Games are played to 11 points.",
            "Must win by at least 2 points.",
            "Service changes every 2 points."
        ],
        scoringType: "set"
    },
    chess: {
        name: "Chess",
        rules: [
            "Standard FIDE rules apply.",
            "Win: 1 point, Draw: 0.5 points, Loss: 0 points.",
            "Time control: As specified for the tournament.",
            "Recording of moves is mandatory if required."
        ],
        scoringType: "chess"
    },
    badminton: {
        name: "Badminton",
        rules: [
            "Matches are best-of-3 games.",
            "Games are played to 21 points.",
            "Must win by at least 2 points (capped at 30).",
            "Rally scoring system applies."
        ],
        scoringType: "set"
    },
    tennis: {
        name: "Lawn Tennis",
        rules: [
            "Points: Love, 15, 30, 40, Game.",
            "Deuce and Advantage used at 40-40.",
            "Sets are played to 6 games (must win by 2).",
            "Tie-break at 6-6 in a set."
        ],
        scoringType: "tennis"
    },
    football: {
        name: "Football",
        rules: [
            "Duration: Two halves of 45 minutes (or as specified).",
            "Points: 1 per goal.",
            "Offside, fouls, and cards as per FIFA laws.",
            "Penalty shootout for knockouts if level after extra time."
        ],
        scoringType: "goal"
    }
};
