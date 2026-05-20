import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AskQuestion = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', body: '', department: '', subject: '', tags: '' });
  const [similar, setSimilar] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const query = form.title.trim();
    if (!query) {
      setSimilar([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/questions', { params: { search: query } });
        setSimilar(data.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [form.title]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) };
      await api.post('/questions', payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to post question');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Ask a Question</h1>
          <p className="text-slate-600 mt-1">Share your doubt with the college community.</p>
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <form className="space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="text-sm text-slate-600">Question Title</span>
            <input className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Details</span>
            <textarea className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 min-h-[180px]" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            <input className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
            <input className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            <input className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <button className="rounded-2xl bg-sky-600 px-5 py-3 text-white font-semibold hover:bg-sky-700">Post Question</button>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Similar Questions</h2>
          <p className="text-sm text-slate-600 mt-2">Review related doubts before posting to avoid repetition.</p>
          <div className="space-y-3 mt-4">
            {similar.length > 0 ? similar.map((item) => {
              const itemId = item.id || item._id;
              return (
                <div key={itemId} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <a href={`/questions/${itemId}`} className="text-sm font-semibold text-slate-900">{item.title}</a>
                  <p className="text-xs text-slate-500 mt-1">{item.department} · {item.subject}</p>
                </div>
              );
            }) : <p className="text-sm text-slate-500">No similar questions found yet.</p>}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AskQuestion;
