import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-violet-500 mb-4">404</div>
        <div className="text-6xl mb-6">🎭</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Looks like this page took a wrong turn. The event you're looking for might have moved or doesn't exist.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link to="/events" className="btn-secondary flex items-center gap-2">
            <Search className="w-4 h-4" /> Browse Events
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
