import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [gender, setGender] = useState('Male');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    // Pre-fill email from localStorage on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            let role;
            if (isLogin) {
                role = await login(email, password);
                localStorage.setItem('rememberedEmail', email);
            } else {
                role = await signup(email, password, fullName, collegeName, gender);
            }

            // Redirect based on the resolved role explicitly
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else if (role === 'scorer') {
                navigate('/scorer/dashboard');
            } else {
                navigate('/viewer/dashboard');
            }

        } catch (err) {
            setError(`Failed to ${isLogin ? 'sign in' : 'create an account'}. Please check your credentials.`);
            console.error(err);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center -mt-16 overflow-hidden relative">
            {/* Animated Background Blobs */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-md glass-card relative z-10 m-4">
                <div className="text-center mb-8">
                    <span className="text-5xl drop-shadow-lg block mb-4">🏅</span>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        {isLogin ? 'Staff Portal' : 'Register Access'}
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm">Authorized personnel only</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center backdrop-blur-sm shadow-inner shadow-red-500/10">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-gray-300 text-sm font-semibold mb-2 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-600 shadow-inner"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-semibold mb-2 ml-1">College Name</label>
                                <input
                                    type="text"
                                    required
                                    value={collegeName}
                                    onChange={(e) => setCollegeName(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-600 shadow-inner"
                                    placeholder="Your College"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-semibold mb-2 ml-1">Gender</label>
                                <select
                                    required
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner appearance-none"
                                >
                                    <option value="Male" className="bg-gray-900">Male</option>
                                    <option value="Female" className="bg-gray-900">Female</option>
                                    <option value="Other" className="bg-gray-900">Other</option>
                                </select>
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-gray-300 text-sm font-semibold mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-600 shadow-inner"
                            placeholder="staff@prakrida.in"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-semibold mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-600 shadow-inner"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full btn-primary text-lg mt-6"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-8 pt-6 text-center border-t border-white/10">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        {isLogin ? (
                            <span>Need an account? <span className="text-primary-400 font-semibold">Sign Up</span></span>
                        ) : (
                            <span>Already registered? <span className="text-primary-400 font-semibold">Sign In</span></span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
