import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import EventCard from '../components/events/EventCard';
import EventFilter from '../components/events/EventFilter';
import { Pagination, EmptyState } from '../components/common/UI';
import { PageSkeleton } from '../components/common/LoadingSkeleton';
import { eventAPI } from '../services/api';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: '',
    startDate: '',
    isFree: '',
    locationType: '',
    sort: 'startDate',
    page: 1,
  });

  const fetchEvents = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v; });
      params.status = 'published';
      const { data } = await eventAPI.getAll(params);
      setEvents(data.data);
      setPagination(data.pagination);
    } catch (e) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(filters); }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleReset = () => {
    setFilters({ search: '', category: '', city: '', startDate: '', isFree: '', locationType: '', sort: 'startDate', page: 1 });
    setSearchParams({});
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Discover Events</h1>
          <EventFilter filters={filters} onChange={handleFilterChange} onReset={handleReset} />
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Loading...' : `${pagination.total} event${pagination.total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <PageSkeleton count={9} />
        ) : events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events found"
            description="Try adjusting your filters or search terms to find events."
            action={<button onClick={handleReset} className="btn-primary">Clear Filters</button>}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, i) => (
                <motion.div key={event._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
            />
          </>
        )}
      </div>
    </div>
  );
}
