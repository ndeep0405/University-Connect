import { useEffect, useState } from 'react';
import api from '../utils/api';
import QuestionCard from '../components/QuestionCard';
import { Link } from 'react-router-dom';
import logo from '../assets/vbit-logo.svg';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ search: '', department: '', subject: '', unanswered: false });

  const fetchQuestions = async () => {
    const params = { ...filters };
    if (!params.unanswered) delete params.unanswered;
    try {
      const { data } = await api.get('/questions', { params });
      setQuestions(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchQuestions();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-8 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 shadow-sm ring-1 ring-slate-200">
              <img src={logo} alt="VBIT Logo" className="h-10 w-10 rounded-xl" />
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-700">University Connect</span>
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">Academic Doubts Feed</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Discover questions, answer colleagues, and learn together — powered by VBIT.</p>
          </div>
          <Link to="/ask" className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-white font-semibold shadow-lg shadow-sky-200/50 transition hover:bg-sky-700">Ask Question</Link>
        </div>
      </div>

      <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3"
          placeholder="Search title or tags"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3"
          placeholder="Department"
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        />
        <input
          className="rounded-2xl border border-slate-200 px-4 py-3"
          placeholder="Subject"
          value={filters.subject}
          onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
        />
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.unanswered}
              onChange={(e) => setFilters({ ...filters, unanswered: e.target.checked })}
            />
            Unanswered only
          </label>
          <button type="submit" className="ml-auto rounded-2xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-800">Filter</button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {questions.length > 0 ? questions.map((question) => <QuestionCard key={question.id || question._id} question={question} />) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No questions found.</div>
        )}
      </div>
    </div>
  );
};

export default Home;
