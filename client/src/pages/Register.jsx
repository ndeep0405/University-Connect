import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', role: 'student' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    console.log('Registration submit started', form);

    try {
      const { data } = await api.post('/auth/register', form);
      console.log('Registration response', data);
      localStorage.setItem('uc_token', data.token);
      localStorage.setItem('uc_user', JSON.stringify(data.user));

      const knownRoutes = ['/', '/login', '/register', '/ask', '/questions/:id', '/profile', '/faculty', '/admin'];
      const redirectPath = knownRoutes.includes('/dashboard') ? '/dashboard' : '/login';
      console.log(`Redirecting to ${redirectPath}`);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      console.error('Registration error', err);
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-3xl shadow-sm">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ⚠️ {errorMessage}
        </div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-slate-600">Full Name</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">College Email</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Department</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Role</span>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-xl text-white py-3 font-semibold transition ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-600">
        Already have an account? <Link className="text-sky-600" to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
