import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Unauthorized() {
    const { userRole } = useAuth();

    // Determine the user's specific dashboard based on their role for the back button
    let dashboardRoute = '/';
    if (userRole === 'admin') dashboardRoute = '/admin/dashboard';
    else if (userRole === 'scorer') dashboardRoute = '/scorer/dashboard';
    else if (userRole === 'viewer') dashboardRoute = '/viewer/dashboard';

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white pb-32">
            <span className="text-6xl mb-6">🚫</span>
            <h1 className="text-4xl font-bold mb-4 text-red-400">Access Denied</h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md text-center">
                You do not have the required permissions to view this page. If you believe this is a mistake, please contact an administrator.
            </p>

            <Link
                to={dashboardRoute}
                className="bg-blue-600 hover:bg-blue-700 font-bold py-3 px-8 rounded-lg transition"
            >
                Return to My Dashboard
            </Link>
        </div>
    );
}
