import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// Temporary Firebase Config for secondary Auth instance
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
import { sports as initialSports } from '../data/mockData';

export default function AdminDashboard() {
    const { currentUser, userRole } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [sportsList, setSportsList] = useState([]);
    const [teamsList, setTeamsList] = useState([]);
    const [matchesList, setMatchesList] = useState([]);
    const [loading, setLoading] = useState(true);

    // New Team Form State
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamCollege, setNewTeamCollege] = useState('');
    const [newTeamSportId, setNewTeamSportId] = useState('');

    // New Match Room Form State
    const [newMatchSportId, setNewMatchSportId] = useState('');
    const [newMatchTeam1Id, setNewMatchTeam1Id] = useState('');
    const [newMatchTeam2Id, setNewMatchTeam2Id] = useState('');
    const [newMatchStartTime, setNewMatchStartTime] = useState('');
    const [newMatchVenue, setNewMatchVenue] = useState('');
    const [newMatchType, setNewMatchType] = useState('League Match');

    const [newSportName, setNewSportName] = useState('');
    const [newSportDesc, setNewSportDesc] = useState('');
    const [newSportTeamSize, setNewSportTeamSize] = useState('');
    const [newSportWinPoints, setNewSportWinPoints] = useState(3);
    const [newSportDrawPoints, setNewSportDrawPoints] = useState(1);
    const [newSportLossPoints, setNewSportLossPoints] = useState(0);
    const [newSportGender, setNewSportGender] = useState('Men');
    const [newTeamGender, setNewTeamGender] = useState('Men');

    // New User Form State
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserCollege, setNewUserCollege] = useState('');
    const [newUserGender, setNewUserGender] = useState('Male');
    const [newUserRole, setNewUserRole] = useState('scorer');

    // Ensure state stays in sync if role is restricted
    useEffect(() => {
        if (userRole === 'sub-admin' && newUserRole !== 'scorer') {
            setNewUserRole('scorer');
        }
    }, [userRole]);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } else if (activeTab === 'sports') {
                const sportsSnapshot = await getDocs(collection(db, 'sports'));
                setSportsList(sportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } else if (activeTab === 'teams') {
                const teamsSnapshot = await getDocs(collection(db, 'teams'));
                setTeamsList(teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } else if (activeTab === 'matches') {
                const sportsSnapshot = await getDocs(collection(db, 'sports'));
                setSportsList(sportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                const teamsSnapshot = await getDocs(collection(db, 'teams'));
                setTeamsList(teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                const matchesSnapshot = await getDocs(collection(db, 'matches'));
                setMatchesList(matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert(`User role updated to ${newRole}`);
        } catch (error) {
            console.error("Error updating user role:", error);
            alert("Failed to update user role");
        }
    };

    const handleRemoveUser = async (userId) => {
        if (window.confirm("Are you sure you want to completely remove this user's access?")) {
            try {
                await deleteDoc(doc(db, 'users', userId));
                setUsers(users.filter(u => u.id !== userId));
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    const handleCreateSport = async (e) => {
        e.preventDefault();
        if (!newSportName || !newSportDesc || !newSportTeamSize) return;

        try {
            const sportData = {
                name: newSportName,
                description: newSportDesc,
                teamSize: parseInt(newSportTeamSize),
                scoringRules: {
                    win: parseInt(newSportWinPoints),
                    draw: parseInt(newSportDrawPoints),
                    loss: parseInt(newSportLossPoints)
                },
                id: `${newSportName.toLowerCase().replace(/\s+/g, '')}_${newSportGender.toLowerCase()}`,
                gender: newSportGender
            };

            await setDoc(doc(db, 'sports', sportData.id), sportData);
            setSportsList([...sportsList, sportData]);

            setNewSportName('');
            setNewSportDesc('');
            setNewSportTeamSize('');
            setNewSportWinPoints(3);
            setNewSportDrawPoints(1);
            setNewSportLossPoints(0);
        } catch (error) {
            console.error("Error creating sport:", error);
        }
    };

    const handleDeleteSport = async (sportId) => {
        if (window.confirm("Are you sure you want to delete this sport? This may break historical match references.")) {
            try {
                await deleteDoc(doc(db, 'sports', sportId));
                setSportsList(sportsList.filter(s => s.id !== sportId));
            } catch (error) {
                console.error("Error deleting sport:", error);
            }
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        if (!newTeamName || !newTeamCollege || !newTeamSportId) return;

        try {
            const teamId = `${newTeamName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
            const teamData = {
                id: teamId,
                name: newTeamName,
                college: newTeamCollege,
                sportId: newTeamSportId,
                matchesPlayed: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                points: 0,
                gender: newTeamGender
            };

            await setDoc(doc(db, 'teams', teamId), teamData);
            setTeamsList([...teamsList, teamData]);
            setNewTeamName('');
            setNewTeamCollege('');
            setNewTeamSportId('');
            alert("Team created successfully!");
        } catch (error) {
            console.error("Error creating team:", error);
            alert("Failed to create team");
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (window.confirm("Are you sure you want to delete this team?")) {
            try {
                await deleteDoc(doc(db, 'teams', teamId));
                setTeamsList(teamsList.filter(t => t.id !== teamId));
            } catch (error) {
                console.error("Error deleting team:", error);
            }
        }
    };

    const handleResetTeamStats = async (teamId) => {
        if (window.confirm("Are you sure you want to RESET all points and stats for this team? This action is permanent.")) {
            try {
                const teamRef = doc(db, 'teams', teamId);
                await updateDoc(teamRef, {
                    matchesPlayed: 0,
                    won: 0,
                    lost: 0,
                    drawn: 0,
                    points: 0
                });
                setTeamsList(teamsList.map(t => t.id === teamId ? { ...t, matchesPlayed: 0, won: 0, lost: 0, drawn: 0, points: 0 } : t));
                alert("Team stats reset successfully.");
            } catch (error) {
                console.error("Error resetting stats:", error);
                alert("Failed to reset stats.");
            }
        }
    };

    const handleDeleteMatch = async (matchId) => {
        if (window.confirm("Are you sure you want to permanently delete this match and its history?")) {
            try {
                await deleteDoc(doc(db, 'matches', matchId));
                setMatchesList(matchesList.filter(m => m.id !== matchId));
            } catch (error) {
                console.error("Error deleting match:", error);
                alert("Failed to delete match.");
            }
        }
    };

    const handleDeleteAllMatches = async () => {
        if (window.confirm("CRITICAL ACTION: Are you sure you want to DELETE ALL matches and history? This cannot be undone.")) {
            try {
                setLoading(true);
                const batchPromises = matchesList.map(match => deleteDoc(doc(db, 'matches', match.id)));
                await Promise.all(batchPromises);
                setMatchesList([]);
                alert("All matches have been cleared.");
            } catch (error) {
                console.error("Error clearing history:", error);
                alert("Failed to clear some matches.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleNuclearReset = async () => {
        const confirm1 = window.confirm("☢️ NUCLEAR RESET: This will delete ALL matches and RESET ALL team points to 0. Are you absolutely sure?");
        if (!confirm1) return;

        const confirm2 = window.confirm("FINAL WARNING: This action is permanent and will wipe the entire tournament's progress. Proceed?");
        if (!confirm2) return;

        try {
            setLoading(true);

            // 1. Delete all matches
            const matchDeletionPromises = matchesList.map(match => deleteDoc(doc(db, 'matches', match.id)));
            await Promise.all(matchDeletionPromises);
            setMatchesList([]);

            // 2. Reset all team stats
            const teamResetPromises = teamsList.map(team =>
                updateDoc(doc(db, 'teams', team.id), {
                    matchesPlayed: 0,
                    won: 0,
                    lost: 0,
                    drawn: 0,
                    points: 0
                })
            );
            await Promise.all(teamResetPromises);
            setTeamsList(teamsList.map(t => ({ ...t, matchesPlayed: 0, won: 0, lost: 0, drawn: 0, points: 0 })));

            alert("Tournament has been successfully reset. All match history wiped and points zeroed.");
        } catch (error) {
            console.error("Nuclear reset failed:", error);
            alert("An error occurred during reset. Some data may not have been cleared.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUserEmail || !newUserPassword || !newUserName) {
            alert("Please fill in all required fields!");
            return;
        }

        setLoading(true);
        let secondaryApp;
        try {
            // Initialize a secondary app to create user without logging out the current admin
            secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
            const secondaryAuth = getAuth(secondaryApp);

            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUserEmail, newUserPassword);
            const user = userCredential.user;

            // Save to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name: newUserName,
                email: newUserEmail,
                role: newUserRole,
                college: newUserCollege || 'N/A',
                gender: newUserGender,
                createdAt: new Date().toISOString(),
                managedBy: currentUser.email
            });

            alert(`User ${newUserEmail} created successfully as ${newUserRole}!`);

            // Reset form
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserName('');
            setNewUserCollege('');
            setNewUserGender('Male');
            setNewUserRole('scorer');

            fetchData();
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Failed to create user: " + error.message);
        } finally {
            if (secondaryApp) {
                // Important to delete the secondary app instance
                secondaryApp.delete();
            }
            setLoading(false);
        }
    };

    const handleCreateMatchRoom = async (e) => {
        e.preventDefault();
        if (!newMatchSportId || !newMatchTeam1Id || !newMatchTeam2Id) return;
        if (newMatchTeam1Id === newMatchTeam2Id) {
            alert("Teams must be different!");
            return;
        }

        try {
            // 1. Resolve Sport
            // Try to detect gender from input if user typed something like "Cricket Women"
            let genderHint = 'Men';
            let cleanSportName = newMatchSportId;
            if (newMatchSportId.toLowerCase().includes('women')) genderHint = 'Women';
            else if (newMatchSportId.toLowerCase().includes('girl')) genderHint = 'Women';
            else if (newMatchSportId.toLowerCase().includes('mixed')) genderHint = 'Mixed';

            let sport = sportsList.find(s => s.id === newMatchSportId || s.name.toLowerCase() === newMatchSportId.toLowerCase());
            let finalSportId = sport?.id;

            if (!sport) {
                // Auto-create new sport
                finalSportId = newMatchSportId.toLowerCase().replace(/\s+/g, '_');
                const newSport = {
                    id: finalSportId,
                    name: newMatchSportId,
                    icon: '🏆',
                    teamSize: 1,
                    gender: genderHint,
                    description: 'New sport added during match creation',
                    scoringRules: { win: 3, draw: 1, loss: 0 }
                };
                await setDoc(doc(db, 'sports', finalSportId), newSport);
                sport = newSport;
                // Add to local list to avoid refresh needed for logic below
                sportsList.push(newSport);
            }

            // 2. Resolve Teams
            const resolveTeam = async (teamInput, placeholderName) => {
                let team = teamsList.find(t => t.id === teamInput || t.name.toLowerCase() === teamInput.toLowerCase());
                if (!team) {
                    const newTeamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                    const newTeam = {
                        id: newTeamId,
                        name: teamInput,
                        college: 'Internal',
                        sportId: finalSportId,
                        matchesPlayed: 0,
                        won: 0,
                        lost: 0,
                        drawn: 0,
                        points: 0
                    };
                    await setDoc(doc(db, 'teams', newTeamId), newTeam);
                    return newTeam;
                }
                return team;
            };

            const team1 = await resolveTeam(newMatchTeam1Id);
            const team2 = await resolveTeam(newMatchTeam2Id);

            const matchId = `match_${Date.now()}`;

            // Initialize sport-specific fields
            let extraFields = {};
            const sportType = finalSportId.toLowerCase();

            if (sportType.includes('cricket')) {
                extraFields = { currentOver: 0, currentBall: 0, wickets: 0, ballsInOver: [], target: 0, innings: 1 };
            } else if (['football', 'hockey', 'kabaddi', 'carrom'].some(s => sportType.includes(s))) {
                extraFields = { half: 1 };
            } else if (sportType.includes('basketball')) {
                extraFields = { quarter: 1 };
            } else if (['volleyball', 'badminton', 'tabletennis', 'tennis', 'lawntennis'].some(s => sportType.includes(s))) {
                extraFields = { sets: { team1: 0, team2: 0 }, currentSetPoints: { team1: 0, team2: 0 } };
            }

            const matchData = {
                id: matchId,
                sportId: finalSportId,
                sportName: sport.name,
                team1Id: team1.id,
                team1Name: team1.name,
                team2Id: team2.id,
                team2Name: team2.name,
                team1Score: 0,
                team2Score: 0,
                status: 'upcoming',
                gender: sport.gender || genderHint,
                createdAt: new Date().toISOString(),
                scheduledStartTime: newMatchStartTime || new Date().toISOString(),
                venue: newMatchVenue || 'TBD',
                matchType: newMatchType,
                ...extraFields
            };

            await setDoc(doc(db, 'matches', matchId), matchData);
            alert("Match Room created successfully!");
            setNewMatchSportId('');
            setNewMatchTeam1Id('');
            setNewMatchTeam2Id('');
            setNewMatchStartTime('');
            setNewMatchVenue('');
            setNewMatchType('League Match');
            fetchData(); // Refresh lists
        } catch (error) {
            console.error("Error creating match room:", error);
            alert("Failed to create match room: " + error.message);
        }
    };

    const handleSeedSports = async () => {
        if (window.confirm("Seed initial sports into Firestore?")) {
            try {
                for (const sport of initialSports) {
                    const slugId = sport.name.toLowerCase().replace(/\s+/g, '');
                    await setDoc(doc(db, 'sports', slugId), {
                        id: slugId,
                        name: sport.name,
                        description: sport.description,
                        teamSize: sport.teamSize,
                        scoringRules: { win: 3, draw: 1, loss: 0 }
                    });
                }
                alert("Sports seeded successfully! Refreshing...");
                fetchData();
            } catch (error) {
                console.error("Error seeding sports:", error);
                alert("Failed to seed sports.");
            }
        }
    };

    const handleSeedTeamsAndMatches = async () => {
        if (!sportsList.length) {
            alert("You must seed or create sports first before seeding teams and matches.");
            return;
        }

        if (window.confirm("This will inject dummy teams and upcoming matches for the first Sport. Proceed?")) {
            try {
                const targetSport = sportsList[0].id;

                const teamA = {
                    id: `team_a_${targetSport}`, name: "Engineering College A", sportId: targetSport, college: "ECA",
                    matchesPlayed: 0, won: 0, drawn: 0, lost: 0, points: 0
                };
                const teamB = {
                    id: `team_b_${targetSport}`, name: "Medical College F", sportId: targetSport, college: "MCF",
                    matchesPlayed: 0, won: 0, drawn: 0, lost: 0, points: 0
                };

                await setDoc(doc(db, 'teams', teamA.id), teamA);
                await setDoc(doc(db, 'teams', teamB.id), teamB);

                const match1 = {
                    id: `match_1_${targetSport}`,
                    sportId: targetSport,
                    team1Id: teamA.id,
                    team1Name: teamA.name,
                    team2Id: teamB.id,
                    team2Name: teamB.name,
                    team1Score: 0,
                    team2Score: 0,
                    status: 'upcoming',
                    createdAt: new Date().toISOString()
                };

                await setDoc(doc(db, 'matches', match1.id), match1);

                alert(`Successfully seeded 2 teams and 1 upcoming match for ${sportsList[0].name}!`);
            } catch (err) {
                console.error("Error seeding matches:", err);
                alert("Failed to seed matches.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 pb-12 relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 -left-6 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-12 w-96 h-96 bg-secondary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

            <div className="pt-28 pb-8 px-4 relative z-10 border-b border-white/5 bg-gray-900/40 backdrop-blur-xl mb-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 mb-2">
                            <span className="mr-4 text-5xl">⚙️</span>
                            Admin Control Panel
                        </h1>
                        <p className="text-gray-400 font-medium">Logged in as: <span className="text-white font-bold">{currentUser?.email}</span></p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex space-x-2 border-b border-white/10 mb-8 overflow-x-auto pb-4 hide-scrollbar">
                    {[
                        { id: 'users', label: '👥 Users' },
                        { id: 'sports', label: '🏅 Sports' },
                        { id: 'teams', label: '🛡️ Teams' },
                        { id: 'matches', label: '🏟️ Match Rooms' },
                        { id: 'dev', label: '🧪 Dev Tools', adminOnly: true }
                    ].filter(tab => !tab.adminOnly || userRole === 'admin').map((tab) => (
                        <button
                            key={tab.id}
                            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300 ${activeTab === tab.id ? 'bg-white/10 text-white shadow-inner border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p>Loading administration data...</p>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {/* USERS TAB */}
                        {activeTab === 'users' && (
                            <div className="space-y-8">
                                <div className="max-w-4xl mx-auto glass-card">
                                    <h2 className="text-3xl font-black text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">Add Staff Account</h2>
                                    <form onSubmit={handleAddUser} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={newUserName}
                                                    onChange={(e) => setNewUserName(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 transition-all"
                                                    placeholder="Enter name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={newUserEmail}
                                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 transition-all"
                                                    placeholder="staff@prakrida.in"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={newUserPassword}
                                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 transition-all"
                                                    placeholder="Minimum 6 characters"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Role</label>
                                                <select
                                                    value={newUserRole}
                                                    onChange={(e) => setNewUserRole(e.target.value)}
                                                    className={`w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 transition-all appearance-none ${userRole === 'sub-admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    disabled={userRole === 'sub-admin'}
                                                >
                                                    <option value="scorer" className="bg-gray-900">Scorer (Scorekeeper)</option>
                                                    <option value="sub-admin" className="bg-gray-900">Sub-Admin (Tournament Manager)</option>
                                                    {userRole === 'admin' && (
                                                        <option value="admin" className="bg-gray-900">Main Admin (Super User)</option>
                                                    )}
                                                </select>
                                                {userRole === 'sub-admin' && (
                                                    <p className="text-[10px] text-gray-500 font-bold mt-1 ml-1 italic">Note: Only Main Admins can create other Admins.</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">College</label>
                                                <input
                                                    type="text"
                                                    value={newUserCollege}
                                                    onChange={(e) => setNewUserCollege(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 transition-all"
                                                    placeholder="College Name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Gender</label>
                                                <select
                                                    value={newUserGender}
                                                    onChange={(e) => setNewUserGender(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 transition-all appearance-none"
                                                >
                                                    <option value="Male" className="bg-gray-900">Male</option>
                                                    <option value="Female" className="bg-gray-900">Female</option>
                                                    <option value="Other" className="bg-gray-900">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-xl">
                                            {loading ? 'Adding User...' : '🚀 Create Staff Account'}
                                        </button>
                                    </form>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {users
                                        .filter(u => u.email !== currentUser?.email)
                                        .map(user => (
                                            <div key={user.id} className="glass-card p-6 border-l-4 border-l-primary-500 hover:border-l-secondary-500 transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-black text-white">{user.name}</h3>
                                                        <p className="text-sm text-gray-400">{user.email}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                        user.role === 'sub-admin' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' :
                                                            'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30'
                                                        }`}>
                                                        {user.role === 'admin' ? 'Main Admin' : user.role === 'sub-admin' ? 'Sub Admin' : 'Scorer'}
                                                    </span>
                                                </div>
                                                <div className="space-y-2 text-sm text-gray-500 font-bold uppercase tracking-wider">
                                                    <div>🏢 {user.college}</div>
                                                    <div>👤 {user.gender}</div>
                                                </div>

                                                {/* Revoke Access Button: Restricted to Main Admin, or Sub Admin only for Scorers */}
                                                {(userRole === 'admin' || (userRole === 'sub-admin' && user.role === 'scorer')) && (
                                                    <button
                                                        onClick={() => handleRemoveUser(user.id)}
                                                        className="mt-6 w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                                                    >
                                                        Revoke Access
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* SPORTS TAB */}
                        {activeTab === 'sports' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 glass-card h-max">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/10 pb-4">
                                        <h2 className="text-2xl font-black text-white">Active Catalog</h2>
                                        <button onClick={handleSeedSports} className="btn-secondary text-sm flex items-center space-x-2">
                                            <span>🌱</span><span>Seed Demo Data</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {sportsList.map(sport => (
                                            <div key={sport.id} className="bg-black/20 p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-all hover:bg-white/5 flex justify-between items-center group">
                                                <div className="flex items-center space-x-4">
                                                    {sport.icon && (
                                                        <span className="text-4xl drop-shadow-md p-2 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">{sport.icon}</span>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-lg text-white">{sport.name} <span className="text-xs text-primary-400">({sport.gender || 'Men'})</span></div>
                                                        <div className="text-xs font-medium text-gray-400 tracking-wide uppercase">Size: {sport.teamSize}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteSport(sport.id)}
                                                    className="text-red-400 opacity-50 hover:opacity-100 hover:bg-red-500/20 p-3 rounded-xl transition-all border border-transparent hover:border-red-500/30"
                                                    title="Delete Sport"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}
                                        {sportsList.length === 0 && (
                                            <div className="col-span-full text-center py-16 text-gray-500 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                                <span className="text-4xl block mb-2 opacity-50">🏟️</span>
                                                <p className="font-medium">No sporting events cataloged.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="glass-card relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full mix-blend-screen filter blur-[64px] opacity-20"></div>
                                    <h2 className="text-xl font-black text-white mb-6 border-b border-white/10 pb-4 relative z-10 flex items-center">
                                        <span className="mr-2">➕</span> Create Event
                                    </h2>
                                    <form onSubmit={handleCreateSport} className="space-y-5 relative z-10">
                                        <div>
                                            <label className="block text-xs font-bold tracking-widest text-gray-400 mb-2 uppercase">Choose Sport Template (Optional)</label>
                                            <select
                                                onChange={(e) => {
                                                    const selected = initialSports.find(s => s.name === e.target.value);
                                                    if (selected) {
                                                        setNewSportName(selected.name);
                                                        setNewSportTeamSize(selected.teamSize.toString());
                                                        setNewSportDesc(selected.description);
                                                    }
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-all font-medium mb-4"
                                            >
                                                <option value="">-- Select Predefined Sport --</option>
                                                {initialSports.map(s => (
                                                    <option key={s.id} value={s.name} className="bg-gray-900">{s.name}</option>
                                                ))}
                                            </select>

                                            <label className="block text-xs font-bold tracking-widest text-gray-400 mb-2 uppercase">Sport Title (Or Type Custom)</label>
                                            <input
                                                type="text" required value={newSportName} onChange={(e) => setNewSportName(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder-gray-600 font-medium" placeholder="e.g. Cricket, Football, or Custom"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold tracking-widest text-gray-400 mb-2 uppercase">Team Size</label>
                                                <input
                                                    type="number" required min="1" value={newSportTeamSize} onChange={(e) => setNewSportTeamSize(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-all placeholder-gray-600 font-bold" placeholder="e.g. 11"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold tracking-widest text-gray-400 mb-2 uppercase">Gender Category</label>
                                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                                {['Men', 'Women', 'Mixed'].map(g => (
                                                    <button
                                                        key={g} type="button"
                                                        onClick={() => setNewSportGender(g)}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${newSportGender === g ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold tracking-widest text-gray-400 mb-2 uppercase">Description</label>
                                            <textarea
                                                required rows="2" value={newSportDesc} onChange={(e) => setNewSportDesc(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-all placeholder-gray-600 font-medium resize-none" placeholder="Format rules..."
                                            />
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                                            <label className="block text-xs font-bold tracking-widest text-primary-300 text-center uppercase">Scoring Matrix (Pts)</label>
                                            <div className="flex gap-3">
                                                <div className="flex-1 text-center">
                                                    <label className="block text-xs text-green-400 font-bold mb-1">Win</label>
                                                    <input
                                                        type="number" required value={newSportWinPoints} onChange={(e) => setNewSportWinPoints(e.target.value)}
                                                        className="w-full bg-black/40 border border-green-500/30 rounded-lg px-2 py-2 text-white outline-none text-center font-bold focus:border-green-500"
                                                    />
                                                </div>
                                                <div className="flex-1 text-center">
                                                    <label className="block text-xs text-gray-400 font-bold mb-1">Draw</label>
                                                    <input
                                                        type="number" required value={newSportDrawPoints} onChange={(e) => setNewSportDrawPoints(e.target.value)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-white outline-none text-center font-bold focus:border-gray-400"
                                                    />
                                                </div>
                                                <div className="flex-1 text-center">
                                                    <label className="block text-xs text-red-400 font-bold mb-1">Loss</label>
                                                    <input
                                                        type="number" required value={newSportLossPoints} onChange={(e) => setNewSportLossPoints(e.target.value)}
                                                        className="w-full bg-black/40 border border-red-500/30 rounded-lg px-2 py-2 text-white outline-none text-center font-bold focus:border-red-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button type="submit" className="btn-primary w-full shadow-lg shadow-primary-500/20 text-lg py-3 mt-4">
                                            Append to Catalog
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* TEAMS TAB */}
                        {activeTab === 'teams' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 glass-card">
                                    <h2 className="text-2xl font-black text-white mb-6">Registered Teams</h2>
                                    <div className="space-y-8">
                                        {Object.entries(
                                            teamsList.reduce((acc, team) => {
                                                const sport = sportsList.find(s => s.id === team.sportId)?.name || team.sportId;
                                                if (!acc[sport]) acc[sport] = [];
                                                acc[sport].push(team);
                                                return acc;
                                            }, {})
                                        ).map(([sportName, teams]) => (
                                            <div key={sportName} className="space-y-4">
                                                <h3 className="text-sm font-black text-primary-400 uppercase tracking-[0.2em] border-b border-white/5 pb-2 ml-1">
                                                    {sportName}
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {teams.map(team => (
                                                        <div key={team.id} className="bg-black/20 p-5 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/5 transition-all">
                                                            <div>
                                                                <div className="font-bold text-lg text-white">{team.name}</div>
                                                                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{team.college} • {team.gender || 'Men'}</div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() => handleResetTeamStats(team.id)}
                                                                    className="text-amber-400 hover:bg-amber-500/10 p-2 rounded-lg transition-all border border-transparent hover:border-amber-500/20"
                                                                    title="Reset Stats (Points to 0)"
                                                                >
                                                                    🔄
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteTeam(team.id)}
                                                                    className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                                                                    title="Delete Team"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {teamsList.length === 0 && (
                                            <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-2xl">No teams registered yet.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="glass-card">
                                    <h2 className="text-xl font-black text-white mb-6 border-b border-white/10 pb-4">Create Team</h2>
                                    <form onSubmit={handleCreateTeam} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Team Name</label>
                                            <input type="text" required value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary-500" placeholder="e.g. Warriors" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">College Name</label>
                                            <input type="text" required value={newTeamCollege} onChange={(e) => setNewTeamCollege(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary-500" placeholder="e.g. Oxford" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Team Gender</label>
                                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                                {['Men', 'Women'].map(g => (
                                                    <button
                                                        key={g} type="button"
                                                        onClick={() => setNewTeamGender(g)}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${newTeamGender === g ? 'bg-secondary-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Sport</label>
                                            <select required value={newTeamSportId} onChange={(e) => setNewTeamSportId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary-500">
                                                <option value="">Select Sport</option>
                                                {sportsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <button type="submit" className="btn-primary w-full py-3 mt-4">Register Team</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* MATCHES ROOM TAB */}
                        {activeTab === 'matches' && (
                            <div className="max-w-4xl mx-auto glass-card">
                                <h2 className="text-3xl font-black text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">Create New Match Room</h2>
                                <form onSubmit={handleCreateMatchRoom} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">1. Sport (Select or Type)</label>
                                            <input
                                                list="sports-list"
                                                required
                                                value={newMatchSportId}
                                                onChange={(e) => setNewMatchSportId(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 transition-all"
                                                placeholder="Type or select sport"
                                            />
                                            <datalist id="sports-list">
                                                {sportsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </datalist>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">2. Team Alpha (Select or Type)</label>
                                            <input
                                                list="teams1-list"
                                                required
                                                value={newMatchTeam1Id}
                                                onChange={(e) => setNewMatchTeam1Id(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 transition-all font-sans"
                                                placeholder="Type or select team"
                                            />
                                            <datalist id="teams1-list">
                                                {teamsList.filter(t => t.sportId === newMatchSportId || !newMatchSportId).map(t => <option key={t.id} value={t.id}>{t.name} ({t.college})</option>)}
                                            </datalist>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">3. Team Beta (Select or Type)</label>
                                            <input
                                                list="teams2-list"
                                                required
                                                value={newMatchTeam2Id}
                                                onChange={(e) => setNewMatchTeam2Id(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 transition-all font-sans"
                                                placeholder="Type or select team"
                                            />
                                            <datalist id="teams2-list">
                                                {teamsList.filter(t => t.sportId === newMatchSportId && t.id !== newMatchTeam1Id).map(t => <option key={t.id} value={t.id}>{t.name} ({t.college})</option>)}
                                            </datalist>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">4. Scheduled Start Time</label>
                                            <input
                                                type="datetime-local"
                                                required
                                                value={newMatchStartTime}
                                                onChange={(e) => setNewMatchStartTime(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 transition-all font-sans"
                                            />
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider pl-2">
                                                Scorer will only be able to start scoring 45 minutes before this time.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">6. Match Type</label>
                                            <select
                                                value={newMatchType}
                                                onChange={(e) => setNewMatchType(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 transition-all appearance-none"
                                            >
                                                <option value="League Match" className="bg-gray-900">League Match</option>
                                                <option value="Quarter-final" className="bg-gray-900">Quarter-final</option>
                                                <option value="Semi-final" className="bg-gray-900">Semi-final</option>
                                                <option value="Final" className="bg-gray-900">Final</option>
                                                <option value="Third Place" className="bg-gray-900">Third Place Match</option>
                                                <option value="Exhibition" className="bg-gray-900">Exhibition</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-primary-500/5 rounded-3xl p-8 border border-primary-500/10 text-center">
                                        <div className="text-sm font-bold text-primary-400 uppercase tracking-widest mb-4">Preview Configuration</div>
                                        <div className="flex items-center justify-center space-x-8">
                                            <div className="text-2xl font-black text-white">{newMatchTeam1Id ? teamsList.find(t => t.id === newMatchTeam1Id)?.name : '?'}</div>
                                            <div className="w-12 h-12 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-gray-500">VS</div>
                                            <div className="text-2xl font-black text-white">{newMatchTeam2Id ? teamsList.find(t => t.id === newMatchTeam2Id)?.name : '?'}</div>
                                        </div>
                                        <div className="mt-4 text-gray-500 font-medium">
                                            Sport: <span className="text-white font-bold">{newMatchSportId ? sportsList.find(s => s.id === newMatchSportId)?.name : 'Not Selected'}</span>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={!newMatchTeam2Id} className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-black py-5 rounded-3xl shadow-2xl shadow-primary-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-3">
                                        <span>🚀</span>
                                        <span>Initialize Match Room</span>
                                    </button>
                                </form>

                                {/* Match Management List */}
                                <div className="mt-16 pt-12 border-t border-white/10">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                        <h2 className="text-3xl font-black text-white italic">Existing Match Rooms</h2>
                                        <button
                                            onClick={handleDeleteAllMatches}
                                            className="px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                        >
                                            ⚠️ Delete All Matches
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {Object.entries(
                                            matchesList.reduce((acc, match) => {
                                                const sport = sportsList.find(s => s.id === match.sportId)?.name || match.sportId || 'Uncategorized';
                                                if (!acc[sport]) acc[sport] = [];
                                                acc[sport].push(match);
                                                return acc;
                                            }, {})
                                        ).map(([sportName, matches]) => (
                                            <div key={sportName} className="space-y-4">
                                                <h3 className="text-sm font-black text-primary-400 uppercase tracking-[0.2em] border-b border-white/5 pb-2">
                                                    {sportName}
                                                </h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {matches.map(match => (
                                                        <div key={match.id} className="glass-card !p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02] hover:bg-white/5 transition-colors border border-white/5 group">
                                                            <div className="flex items-center space-x-6">
                                                                <div className="text-sm font-black text-white px-3 py-1 bg-white/5 rounded-lg border border-white/10 uppercase tracking-tighter italic">
                                                                    ID: {match.id.slice(-6).toUpperCase()}
                                                                </div>
                                                                <div className="flex items-center space-x-3">
                                                                    <span className="font-bold text-gray-100">{match.team1Name || 'Team 1'}</span>
                                                                    <span className="text-[10px] font-black text-gray-500 uppercase italic">VS</span>
                                                                    <span className="font-bold text-gray-100">{match.team2Name || 'Team 2'}</span>
                                                                </div>
                                                                <div className="hidden lg:flex items-center space-x-4 text-xs font-medium text-gray-500 uppercase tracking-widest">
                                                                    <span>🕒 {new Date(match.scheduledStartTime).toLocaleString()}</span>
                                                                    <span>📍 {match.venue}</span>
                                                                    <span className="text-primary-400 font-black">[{match.matchType || 'League'}]</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteMatch(match.id)}
                                                                className="w-full sm:w-auto p-3 text-red-400 opacity-50 group-hover:opacity-100 hover:bg-red-500/20 rounded-xl transition-all border border-transparent hover:border-red-500/30"
                                                                title="Delete match document"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {matchesList.length === 0 && (
                                            <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                                                <div className="text-4xl mb-4 opacity-30">🏟️</div>
                                                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm italic">No match documents found in history.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SEED/DEV TAB */}
                        {activeTab === 'dev' && (
                            <div className="glass-card max-w-2xl mx-auto text-center py-16 px-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 mix-blend-overlay"></div>
                                <h2 className="text-3xl font-black text-white mb-6 relative z-10 drop-shadow-md">System Simulation</h2>
                                <p className="text-gray-300 mb-10 text-lg font-medium relative z-10">
                                    To test the live-scoring and points computation, we need some dummy teams and match documents in Firestore.
                                    Clicking the button below will immediately create 2 teams and 1 match for the first Sport in your list.
                                </p>
                                <button
                                    onClick={handleSeedTeamsAndMatches}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-purple-500/30 flex items-center justify-center mx-auto text-lg relative z-10 group mb-6"
                                >
                                    <span className="mr-3 text-2xl group-hover:rotate-12 transition-transform">🧪</span> Inject Dev Data Environment
                                </button>

                                <div className="pt-8 border-t border-white/5">
                                    <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">Danger Zone</h3>
                                    <button
                                        onClick={handleNuclearReset}
                                        className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-red-500/20 flex items-center justify-center mx-auto text-lg relative z-10 group"
                                    >
                                        <span className="mr-3 text-2xl group-hover:animate-pulse">☢️</span> Reset Entire Tournament
                                    </button>
                                    <p className="mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Wipes all match documents & resets all team points to 0.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
