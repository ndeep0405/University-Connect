import { useEffect, useState } from 'react';
import api from '../utils/api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateUser = async (id, update) => {
    try {
      await api.put(`/admin/users/${id}/role`, update);
      setMessage('User updated successfully');
      loadUsers();
    } catch (error) {
      setMessage('Unable to update user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="text-slate-600 mt-2">Manage users, departments, and monitor activity.</p>
      </div>
      {message && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">{message}</div>}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Role</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Department</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 text-sm text-slate-700">{user.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{user.role}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{user.department}</td>
                <td className="px-6 py-4 text-sm text-slate-700 space-x-2">
                  <button
                    onClick={() => updateUser(user._id, { role: 'student' })}
                    className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200"
                  >Student</button>
                  <button
                    onClick={() => updateUser(user._id, { role: 'faculty' })}
                    className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200"
                  >Faculty</button>
                  <button
                    onClick={() => updateUser(user._id, { role: 'admin' })}
                    className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200"
                  >Admin</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
