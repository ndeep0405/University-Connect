import { useState, useEffect } from 'react';
import api from '../utils/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState({ questions: 0, answers: 0 });

  useEffect(() => {
    const stored = localStorage.getItem('uc_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const activityResponse = await api.get('/users/activity');
        setActivity({
          questions: activityResponse.data.questions || 0,
          answers: activityResponse.data.answers || 0,
        });
      } catch (err) {
        console.error('Profile activity load failed', err);
      }
    };
    if (user) loadActivity();
  }, [user]);

  if (!user) return <div className="text-slate-500">Loading profile...</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <section className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-24 w-24 rounded-full bg-sky-100 flex items-center justify-center text-3xl text-sky-700">{user.name?.[0]}</div>
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-slate-500">{user.role} • {user.department}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Reputation</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{user.reputation}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-2 text-slate-900">{user.email}</p>
          </div>
        </div>
      </section>
      <section className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Activity</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
            <p className="text-sm text-slate-500">Questions</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{activity.questions}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
            <p className="text-sm text-slate-500">Verified answers</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{activity.answers}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
