// ============================================================
// Admin Users Page
// ============================================================
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Shield, ShieldOff, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { StatusBadge, Pagination } from '../../components/common/UI';
import AdminLayout from './AdminLayout';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ page, limit: 20, search: search || undefined });
      setUsers(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleRoleToggle = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminAPI.updateUserRole(id, newRole);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch { toast.error('Failed to update role'); }
  };

  const handleStatusToggle = async (id) => {
    try {
      const { data } = await adminAPI.toggleUserStatus(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.data.isActive } : u));
      toast.success(data.message);
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <AdminLayout title={`Users (${total})`}>
      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..." className="input pl-9 text-sm" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? Array(6).fill(null).map((_, i) => (
                <tr key={i}>{Array(6).fill(null).map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-full" /></td>)}</tr>
              )) : users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.role === 'admin' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleRoleToggle(user._id, user.role)}
                        className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 text-gray-400 hover:text-primary-600 transition-colors"
                        title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}>
                        {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleStatusToggle(user._id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                        title={user.isActive ? 'Deactivate' : 'Activate'}>
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && users.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">No users found</div>
          )}
        </div>
      </div>
      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </AdminLayout>
  );
}
