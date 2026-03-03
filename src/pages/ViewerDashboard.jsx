import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function ViewerDashboard() {
    const { currentUser } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-12">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold flex items-center">
                        <span className="mr-3">👁️</span>
                        Viewer Profile
                    </h1>
                    <p className="text-gray-400 mt-2">Logged in as {currentUser?.email}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-xl">
                    <h2 className="text-xl font-bold mb-2">Welcome to PRAKRIDA 2026</h2>
                    <p className="text-gray-300 mb-6">You are logged in with Viewer access. As a viewer, you can see live matches and results but cannot modify any scores.</p>

                    <div className="flex gap-4">
                        <Link to="/live-matches" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition">
                            Watch Live Matches
                        </Link>
                        <Link to="/points-table" className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-4 py-2 rounded font-medium transition">
                            Check Standings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
