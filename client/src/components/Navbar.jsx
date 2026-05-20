import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/vbit-logo.svg';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('uc_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('uc_token');
    localStorage.removeItem('uc_user');
    navigate('/login');
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
