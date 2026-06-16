// ============================================================
// EventFilter - Search and filter sidebar/bar
// ============================================================
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { categoryAPI } from '../../services/api';

export default function EventFilter({ filters, onChange, onReset }) {
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  const handleChange = (key, value) => onChange({ ...filters, [key]: value });

  const activeCount = [filters.category, filters.city, filters.startDate, filters.isFree, filters.locationType]
    .filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={filters.search || ''}
            onChange={e => handleChange('search', e.target.value)}
            className="input pl-10"
          />
          {filters.search && (
            <button onClick={() => handleChange('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters || activeCount > 0
              ? 'border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-950/30 dark:text-primary-400'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 bg-white dark:bg-gray-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
              {activeCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        {activeCount > 0 && (
          <button onClick={onReset} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors bg-white dark:bg-gray-800 dark:border-red-900">
            Clear
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          {/* Category */}
          <div>
            <label className="label text-xs">Category</label>
            <select
              value={filters.category || ''}
              onChange={e => handleChange('category', e.target.value)}
              className="input text-sm py-2"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="label text-xs">City</label>
            <input
              type="text"
              placeholder="Any city"
              value={filters.city || ''}
              onChange={e => handleChange('city', e.target.value)}
              className="input text-sm py-2"
            />
          </div>

          {/* Date */}
          <div>
            <label className="label text-xs">From Date</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={e => handleChange('startDate', e.target.value)}
              className="input text-sm py-2"
            />
          </div>

          {/* Location type */}
          <div>
            <label className="label text-xs">Format</label>
            <select
              value={filters.locationType || ''}
              onChange={e => handleChange('locationType', e.target.value)}
              className="input text-sm py-2"
            >
              <option value="">All Formats</option>
              <option value="physical">In-Person</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="label text-xs">Price</label>
            <select
              value={filters.isFree || ''}
              onChange={e => handleChange('isFree', e.target.value)}
              className="input text-sm py-2"
            >
              <option value="">Any Price</option>
              <option value="true">Free</option>
              <option value="false">Paid</option>
            </select>
          </div>
        </div>
      )}

      {/* Sort bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sort:</span>
        {[
          { value: 'startDate', label: 'Soonest' },
          { value: '-startDate', label: 'Latest' },
          { value: '-views', label: 'Popular' },
          { value: 'tickets.price', label: 'Cheapest' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => handleChange('sort', opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              (filters.sort || 'startDate') === opt.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
