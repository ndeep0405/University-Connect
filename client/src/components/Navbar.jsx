import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/vbit-logo.svg';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem('uc_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (err) {
          console.error('Failed to parse user from localStorage', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Load user initially
    loadUser();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'uc_user' || e.key === 'uc_token') {
        loadUser();
      }
    };

    // Hook into localStorage.setItem to detect changes in same tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      if (key === 'uc_user' || key === 'uc_token') {
        loadUser();
      }
      originalSetItem.apply(this, arguments);
    };

    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function(key) {
      if (key === 'uc_user' || key === 'uc_token') {
        setUser(null);
      }
      originalRemoveItem.apply(this, arguments);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('uc_token');
    localStorage.removeItem('uc_user');
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3 text-slate-900">
          <img src={logo} alt="VBIT Logo" className="h-12 w-12 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm" />
          <div>
            <div className="text-xl font-semibold">University Connect</div>
            <div className="text-xs uppercase tracking-[0.25em] text-sky-600">By VBIT</div>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          {user ? (
            <>
              <Link to="/">Feed</Link>
              <Link to="/ask">Ask</Link>
              <Link to="/faculty">Faculty</Link>
              <Link to="/profile">Profile</Link>
              {user.role === 'admin' && <Link to="/admin">Admin</Link>}
              <button onClick={logout} className="text-sky-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
