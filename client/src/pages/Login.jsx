import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('Login submit started', { email: form.email });

    try {
      console.log(`Attempting login to ${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`);
      const { data } = await api.post('/auth/login', form);
      console.log('Login successful', { user: data.user?.email });
      localStorage.setItem('uc_token', data.token);
      localStorage.setItem('uc_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.';
      console.error('Login error:', err.response?.data || err.message);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ⚠️ {error}
        </div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-slate-600">College Email</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={isLoading}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Password</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={isLoading}
            required
          />
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-xl text-white py-3 font-semibold transition ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-600">
        New to University Connect? <Link className="text-sky-600" to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
