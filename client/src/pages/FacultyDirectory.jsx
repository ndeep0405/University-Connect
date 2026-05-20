import { useEffect, useState } from 'react';
import api from '../utils/api';

const FacultyDirectory = () => {
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const { data } = await api.get('/users/faculty');
        setFaculty(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadFaculty();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Faculty Directory</h1>
        <p className="text-slate-600 mt-2">Browse faculty members and their verified contributions.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {faculty.map((item) => (
          <div key={item._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-xl text-slate-700">{item.name?.[0]}</div>
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-slate-500">{item.department}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">Reputation {item.reputation}</span>
              <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1">Verified answers {item.verifiedCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultyDirectory;
