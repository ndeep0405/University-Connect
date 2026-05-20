import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AskQuestion from './pages/AskQuestion';
import QuestionDetail from './pages/QuestionDetail';
import Profile from './pages/Profile';
import FacultyDirectory from './pages/FacultyDirectory';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [token, setToken] = useState(localStorage.getItem('uc_token'));

  useEffect(() => {
    // Listen for storage changes (login/logout from other tabs or updates)
    const handleStorageChange = () => {
      setToken(localStorage.getItem('uc_token'));
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for token updates in the same tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      if (key === 'uc_token') {
        setToken(value);
      }
      originalSetItem.apply(this, arguments);
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
          <Route
            path="/ask"
            element={<ProtectedRoute><AskQuestion /></ProtectedRoute>}
          />
          <Route path="/questions/:id" element={<ProtectedRoute><QuestionDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/faculty" element={<ProtectedRoute><FacultyDirectory /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
