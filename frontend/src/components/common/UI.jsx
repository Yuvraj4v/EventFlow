// ============================================================
// Shared UI Components
// ============================================================
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Status Badge ─────────────────────────────────────────────
export function StatusBadge({ status }) {
  const config = {
    confirmed:  { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Confirmed' },
    pending:    { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Pending' },
    cancelled:  { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Cancelled' },
    attended:   { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Attended' },
    published:  { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Published' },
    draft:      { color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', label: 'Draft' },
    completed:  { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Completed' },
    'no-show':  { color: 'bg-gray-100 text-gray-500', label: 'No Show' },
  };
  const c = config[status] || { color: 'bg-gray-100 text-gray-600', label: status };
  return <span className={`badge ${c.color}`}>{c.label}</span>;
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${sizes[size]} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden`}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Alert / Empty State ──────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        {Icon && <Icon className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 font-semibold px-4 py-2.5 rounded-xl transition-all ${
            danger
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'btn-primary'
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ─── Pagination ───────────────────────────────────────────────
export function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: Math.min(pages, 7) }, (_, i) => {
    if (pages <= 7) return i + 1;
    if (i === 0) return 1;
    if (i === 6) return pages;
    if (page <= 4) return i + 1;
    if (page >= pages - 3) return pages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-40 btn-secondary"
      >
        ← Prev
      </button>
      {nums.map(n => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
            n === page ? 'bg-primary-600 text-white shadow-sm' : 'btn-secondary'
          }`}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-40 btn-secondary"
      >
        Next →
      </button>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' };
  return (
    <div className={`${s[size]} border-primary-500 border-t-transparent rounded-full animate-spin ${className}`} />
  );
}

// ─── Section Header ───────────────────────────────────────────
export function SectionHeader({ eyebrow, title, subtitle, centered = true }) {
  return (
    <div className={`mb-10 ${centered ? 'text-center' : ''}`}>
      {eyebrow && (
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-950/50 px-3 py-1 rounded-full mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
      {subtitle && <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base">{subtitle}</p>}
    </div>
  );
}
