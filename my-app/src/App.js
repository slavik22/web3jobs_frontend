import './App.css';
import { useEffect, useState } from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import JobsPage from './pages/JobsPage';
import JobDetail from './pages/JobDetail';
import JobFormPage from './pages/JobFormPage';


import { clearTokens, getUser, isAuthenticated, clearUser } from './lib/auth';

export default function App() {
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const navigate = useNavigate();

  // Перевіряємо локально: якщо є токени — вважаємо залогіненим,
  // пробуємо тихий refresh (ensureAccess) і беремо user з localStorage

  useEffect(() => {
    // якщо хочеш робити тихий refresh — розкоментуй:
    // (async () => {
    //   const hasAuth = await ensureAccess();
    //   if (hasAuth && isAuthenticated()) setMe(getUser());
    //   setLoadingMe(false);
    // })();

    // без тихого refresh: просто читаємо локально
    const u = getUser();
    setMe(isAuthenticated() ? u : null);
    setLoadingMe(false);
  }, []);

   useEffect(() => {
    const onAuth = () => {
      const u = getUser();
      setMe(isAuthenticated() ? u : null);
      setLoadingMe(false);
    };
    window.addEventListener('auth:changed', onAuth);
    return () => window.removeEventListener('auth:changed', onAuth);
  }, []);

  const logout = () => {
    clearTokens();
    clearUser();
    setMe(null);
    navigate('/');
  };

  const dashboardHref =
    me?.role === 'admin'
      ? '/admin/dashboard'
      : me?.role === 'recruiter'
        ? '/recruiter/dashboard'
        : '/dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="text-xl font-extrabold">Web3 Jobs</NavLink>

          <nav className="flex items-center gap-3">

            {!loadingMe && me ? (
              <>
                <NavLink to="/jobs" className="btn btn-outline">Вакансії</NavLink>
                <NavLink to={dashboardHref} className="btn btn-outline">Dashboard</NavLink>
                <NavLink to="/profile" className="btn btn-outline">Profile</NavLink>
                <button onClick={logout} className="btn btn-primary">Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/register" className="btn btn-outline">Реєстрація</NavLink>
                <NavLink to="/login" className="btn btn-primary">Вхід</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage onAuth={(u) => setMe(u)} />} />
          <Route path="/login" element={<LoginPage onAuth={(u) => setMe(u)} />} />

          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetail />} />  
          <Route path="/recruiter/job/create" element={<JobFormPage />} />
          <Route path="/recruiter/job/:id/edit" element={<JobFormPage />} />
        </Routes>
      </main>

      <footer className="border-t">
        <div className="container mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
          © {new Date().getFullYear()} Web3 Jobs
        </div>
      </footer>
    </div>
  );
}
