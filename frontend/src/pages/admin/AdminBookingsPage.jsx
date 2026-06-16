import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { StatusBadge, Pagination } from '../../components/common/UI';
import AdminLayout from './AdminLayout';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getAllBookings({
        page, limit: 20,
        ...(statusFilter && { status: statusFilter })
      });
      setBookings(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [page, statusFilter]);

  return (
    <AdminLayout title={`Bookings (${total})`}>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'confirmed', 'pending', 'cancelled', 'attended'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${statusFilter === s ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Reference', 'User', 'Event', 'Tickets', 'Amount', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? Array(6).fill(null).map((_, i) => (
                <tr key={i}>{Array(7).fill(null).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-full" /></td>
                ))}</tr>
              )) : bookings.map(b => (
                <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-primary-600 dark:text-primary-400">{b.bookingReference}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{b.user?.name}</div>
                    <div className="text-xs text-gray-400">{b.user?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700 dark:text-gray-300 max-w-[160px] truncate">{b.event?.title}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {b.tickets?.reduce((s, t) => s + t.quantity, 0) || 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {b.payment?.amount === 0 ? 'Free' : `$${b.payment?.amount || 0}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {format(new Date(b.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && bookings.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">No bookings found</div>
          )}
        </div>
      </div>
      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </AdminLayout>
  );
}
