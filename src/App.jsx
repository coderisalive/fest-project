import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import LiveMatches from './pages/LiveMatches.jsx';
import SportsList from './pages/SportsList.jsx';
import PointsTablePage from './pages/PointsTablePage.jsx';
import MatchResults from './pages/MatchResults.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ScorerDashboard from './pages/ScorerDashboard.jsx';
import ViewerDashboard from './pages/ViewerDashboard.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import ScorerMatch from './pages/ScorerMatch.jsx';
import Unauthorized from './pages/Unauthorized.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/live-matches" element={<LiveMatches />} />
              <Route path="/sports" element={<SportsList />} />
              <Route path="/points-table" element={<PointsTablePage />} />
              <Route path="/results" element={<MatchResults />} />
              <Route path="/schedule/:sportId" element={<SchedulePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'sub-admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scorer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'sub-admin', 'scorer']}>
                    <ScorerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scorer/match/:matchId"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'sub-admin', 'scorer']}>
                    <ScorerMatch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/viewer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'scorer', 'viewer']}>
                    <ViewerDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
