import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Bookmark, CheckCircle, Clock, ArrowRight, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import useAuthStore from '../context/authStore';
import { userAPI } from '../services/api';
import { StatusBadge } from '../components/common/UI';
import { StatCardSkeleton } from '../components/common/LoadingSkeleton';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getDashboardStats().then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { icon: Ticket, label: 'Total Bookings', value: stats.stats.totalBookings, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/30' },
    { icon: Clock, label: 'Upcoming Events', value: stats.stats.upcomingBookings, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { icon: CheckCircle, label: 'Attended', value: stats.stats.attendedBookings, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { icon: Bookmark, label: 'Saved Events', value: stats.stats.savedCount, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ] : [];

  return (
    <div className="pt-20 min-h-screen pb-12">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your events.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? Array(4).fill(null).map((_, i) => <StatCardSkeleton key={i} />) :
            statCards.map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="card p-5">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</div>
              </motion.div>
            ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white">Recent Bookings</h2>
                <Link to="/bookings" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {loading ? (
                <div className="p-5 space-y-4">
                  {Array(3).fill(null).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
                </div>
              ) : stats?.recentBookings?.length === 0 ? (
                <div className="p-10 text-center">
                  <Ticket className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No bookings yet</p>
                  <Link to="/events" className="btn-primary text-sm mt-4 inline-block">Browse Events</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stats?.recentBookings?.map(booking => (
                    <Link key={booking._id} to={`/bookings/${booking._id}`}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {booking.event?.coverImage ? (
                        <img src={booking.event.coverImage} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt="" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center flex-shrink-0 text-xl">🎉</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">{booking.event?.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {booking.event?.startDate && format(new Date(booking.event.startDate), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{booking.bookingReference}</div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { to: '/events', icon: '🔍', label: 'Browse Events', desc: 'Discover new events' },
                  { to: '/bookings', icon: '🎟️', label: 'My Bookings', desc: 'View your tickets' },
                  { to: '/saved', icon: '❤️', label: 'Saved Events', desc: 'Your wishlist' },
                  { to: '/profile', icon: '👤', label: 'Edit Profile', desc: 'Update your info' },
                ].map(action => (
                  <Link key={action.to} to={action.to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <span className="text-xl">{action.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{action.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{action.desc}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto group-hover:text-primary-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Profile completion */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Profile Completion</h3>
              {[
                { label: 'Name', done: !!user?.name },
                { label: 'Email verified', done: user?.isEmailVerified },
                { label: 'Phone number', done: !!user?.phone },
                { label: 'Bio added', done: !!user?.bio },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 mb-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.done ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {item.done && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-xs ${item.done ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 line-through'}`}>{item.label}</span>
                </div>
              ))}
              <Link to="/profile" className="btn-outline text-xs w-full text-center mt-3 py-2 block">Complete Profile</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
