// ============================================================
// EventCard - Reusable event card component
// ============================================================
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Bookmark, BookmarkCheck, Clock, Wifi } from 'lucide-react';
import { format } from 'date-fns';
import useAuthStore from '../../context/authStore';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function EventCard({ event, variant = 'default' }) {
  const { isAuthenticated, user, toggleSavedEvent } = useAuthStore();

  const isSaved = user?.savedEvents?.some(id => (id?._id || id) === event._id);
  
  const minPrice = event.isFree ? 0 : (event.minPrice || event.tickets?.[0]?.price || 0);
  const maxPrice = event.maxPrice || Math.max(...(event.tickets?.map(t => t.price) || [0]));
  
  const priceLabel = event.isFree || minPrice === 0
    ? 'Free'
    : minPrice === maxPrice
    ? `$${minPrice}`
    : `From $${minPrice}`;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to save events'); return; }
    try {
      await userAPI.toggleSaveEvent(event._id);
      toggleSavedEvent(event._id);
      toast.success(isSaved ? 'Removed from saved' : 'Event saved!');
    } catch (e) {
      toast.error('Failed to save event');
    }
  };

  const isOnline = event.location?.type === 'online';
  const isUpcoming = new Date(event.startDate) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="event-card group"
    >
      <Link to={`/events/${event.slug || event._id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[16/9]">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-violet-600 flex items-center justify-center">
              <span className="text-5xl">{event.category?.icon || '🎉'}</span>
            </div>
          )}
          
          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {event.isFeatured && (
              <span className="badge bg-amber-400 text-amber-900">⭐ Featured</span>
            )}
            {event.isFree || minPrice === 0 ? (
              <span className="badge bg-emerald-500 text-white">Free</span>
            ) : null}
            {isOnline && (
              <span className="badge bg-blue-500 text-white gap-1">
                <Wifi className="w-3 h-3" /> Online
              </span>
            )}
          </div>

          {/* Price badge */}
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm">
              {priceLabel}
            </span>
          </div>

          {/* Category */}
          {event.category && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium glass text-white">
                {event.category.icon} {event.category.name}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {event.title}
          </h3>

          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-primary-400" />
              <span className="truncate">
                {format(new Date(event.startDate), 'EEE, MMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {isOnline ? (
                <><Wifi className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" /><span>Online Event</span></>
              ) : (
                <><MapPin className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                <span className="truncate">{event.location?.city || event.location?.venue || 'TBA'}{event.location?.state ? `, ${event.location.state}` : ''}</span></>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5">
              {event.organizer?.avatar ? (
                <img src={event.organizer.avatar} className="w-6 h-6 rounded-full" alt="" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                  {event.organizer?.name?.charAt(0) || 'O'}
                </div>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                {event.organizer?.name || 'Organizer'}
              </span>
            </div>

            <button
              onClick={handleSave}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-primary-500" />
              ) : (
                <Bookmark className="w-4 h-4 text-gray-400 hover:text-primary-500 transition-colors" />
              )}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
