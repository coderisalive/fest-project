import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userRole, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/live-matches', label: 'Live' },
    { path: '/sports', label: 'Sports' },
    { path: '/points-table', label: 'Points' },
    { path: '/results', label: 'Result' }
  ];

  /* Add conditional items based on role */
  const dynamicNavItems = [...navItems];
  if (userRole === 'admin' || userRole === 'sub-admin') {
    dynamicNavItems.push({ path: '/admin/dashboard', label: 'Admin', icon: '⚙️' });
  }
  if (userRole === 'admin' || userRole === 'sub-admin' || userRole === 'scorer') {
    dynamicNavItems.push({ path: '/scorer/dashboard', label: 'ScorePanel', icon: '📝' });
  }

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent pt-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${scrolled ? 'h-16' : 'h-24'}`}>
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="font-sporty text-2xl tracking-tighter">
              <span className="text-white">PRAK</span>
              <span className="text-primary-500">RIDA '26</span>
            </span>
          </Link>

          <div className="hidden md:flex space-x-1 items-center">
            {dynamicNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 text-xs font-sporty tracking-[0.1em] transition-all duration-300 relative group ${location.pathname === item.path
                  ? 'text-primary-500'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                {item.label}
                {/* Active Indicator */}
                <div className={`absolute -bottom-1 left-4 right-4 h-0.5 bg-primary-500 transition-all duration-300 ${location.pathname === item.path ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>
              </Link>
            ))}

            {currentUser ? (
              <div className="pl-2 border-l border-white/10 ml-2">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gradient-to-r from-red-600/80 to-pink-600/80 text-white hover:from-red-500 hover:to-pink-500 rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-900/20"
                >
                  Logout ({userRole})
                </button>
              </div>
            ) : (
              <div className="pl-2 border-l border-white/10 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-gradient-to-r from-primary-600/80 to-secondary-600/80 text-white hover:from-primary-500 hover:to-secondary-500 rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary-900/20"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <span className="mr-4 lg:hidden p-2 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-white/10 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
