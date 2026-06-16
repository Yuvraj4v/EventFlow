import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye, Star, StarOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventAPI, adminAPI } from '../../services/api';
import { StatusBadge, ConfirmDialog, Pagination } from '../../components/common/UI';
import AdminLayout from './AdminLayout';

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...(statusFilter && { status: statusFilter }) };
      const { data } = await eventAPI.getAll(params);
      setEvents(data.data);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [page, statusFilter]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await eventAPI.delete(deleteId);
      toast.success('Event deleted');
      setDeleteId(null);
      fetchEvents();
    } catch (e) {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const { data } = await adminAPI.toggleFeatured(id);
      setEvents(prev => prev.map(e => e._id === id ? { ...e, isFeatured: data.data.isFeatured } : e));
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminAPI.updateEventStatus(id, status);
      setEvents(prev => prev.map(e => e._id === id ? { ...e, status } : e));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout title={`Events (${total})`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {['', 'published', 'draft', 'cancelled'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${statusFilter === s ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <Link to="/admin/events/new" className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Event
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Event', 'Category', 'Date', 'Tickets', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                Array(6).fill(null).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(null).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-5 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : events.map(event => (
                <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {event.coverImage ? (
                        <img src={event.coverImage} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg flex-shrink-0">🎉</div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{event.title}</div>
                        {event.isFeatured && <span className="text-xs text-amber-500">⭐ Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{event.category?.name || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {format(new Date(event.startDate), 'MMM d, yyyy')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {event.tickets?.reduce((s, t) => s + t.sold, 0)}/{event.tickets?.reduce((s, t) => s + t.quantity, 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={event.status} onChange={e => handleStatusChange(event._id, e.target.value)}
                      className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {['draft', 'published', 'cancelled', 'completed'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/events/${event.slug || event._id}`} target="_blank"
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleToggleFeatured(event._id)}
                        className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 text-gray-400 hover:text-amber-500 transition-colors">
                        {event.isFeatured ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> : <StarOff className="w-4 h-4" />}
                      </button>
                      <Link to={`/admin/events/${event._id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 text-gray-400 hover:text-primary-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => setDeleteId(event._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && events.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <p className="mb-4">No events found</p>
              <Link to="/admin/events/new" className="btn-primary text-sm">Create First Event</Link>
            </div>
          )}
        </div>
      </div>

      <Pagination page={page} pages={pages} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Event" message="Are you sure? This will permanently delete the event and all associated data."
        confirmLabel="Delete" danger loading={deleting}
      />
    </AdminLayout>
  );
}
