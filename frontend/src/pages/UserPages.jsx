// ============================================================
// User Pages — Bookings, BookingDetail, Profile, SavedEvents
// ============================================================
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Calendar, MapPin, Ticket, ArrowLeft, Download, X, Bookmark,
  User, Phone, Mail, MapPin as MapPinIcon, Bell, Save, Wifi
} from 'lucide-react';
import { bookingAPI, userAPI } from '../services/api';
import useAuthStore from '../context/authStore';
import EventCard from '../components/events/EventCard';
import { StatusBadge, EmptyState, ConfirmDialog, Spinner } from '../components/common/UI';
import { PageSkeleton } from '../components/common/LoadingSkeleton';

// ─── BOOKINGS PAGE ────────────────────────────────────────────
export function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    bookingAPI.getMyBookings({ status: filter || undefined })
      .then(r => setBookings(r.data.data))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="pt-20 min-h-screen pb-12">
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
          <div className="flex gap-2">
            {['', 'confirmed', 'pending', 'cancelled'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === s ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">{Array(4).fill(null).map((_, i) => <div key={i} className="skeleton rounded-2xl h-28" />)}</div>
        ) : bookings.length === 0 ? (
          <EmptyState icon={Ticket} title="No bookings found" description="You haven't booked any events yet."
            action={<Link to="/events" className="btn-primary">Browse Events</Link>} />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, i) => (
              <motion.div key={booking._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/bookings/${booking._id}`} className="card flex gap-4 p-4 hover:shadow-md transition-shadow block">
                  {booking.event?.coverImage ? (
                    <img src={booking.event.coverImage} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center flex-shrink-0 text-2xl">🎉</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{booking.event?.title}</h3>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{booking.event?.startDate && format(new Date(booking.event.startDate), 'MMM d, yyyy')}</span>
                      {booking.event?.location?.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{booking.event.location.city}</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Ref: {booking.bookingReference}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BOOKING DETAIL PAGE ──────────────────────────────────────
export function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    bookingAPI.getOne(id).then(r => setBooking(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await bookingAPI.cancel(id, 'Cancelled by user');
      setBooking(b => ({ ...b, status: 'cancelled' }));
      setCancelModal(false);
      toast.success('Booking cancelled');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="pt-20 flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;
  if (!booking) return null;

  return (
    <div className="pt-20 min-h-screen pb-12">
      <div className="container-custom py-8 max-w-3xl">
        <button onClick={() => navigate('/bookings')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Bookings
        </button>

        <div className="card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-violet-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs opacity-75 mb-1">Booking Reference</div>
                <div className="text-xl font-bold font-mono">{booking.bookingReference}</div>
              </div>
              <StatusBadge status={booking.status} />
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Event info */}
            <div className="flex gap-4">
              {booking.event?.coverImage ? (
                <img src={booking.event.coverImage} className="w-20 h-20 rounded-xl object-cover" alt="" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-2xl">🎉</div>
              )}
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">{booking.event?.title}</h2>
                {booking.event?.startDate && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar className="w-4 h-4" />{format(new Date(booking.event.startDate), 'EEEE, MMMM d, yyyy')}
                  </div>
                )}
                {booking.event?.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {booking.event.location.type === 'online' ? <Wifi className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    {booking.event.location.type === 'online' ? 'Online Event' : booking.event.location.city}
                  </div>
                )}
              </div>
            </div>

            {/* Attendee info */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Attendee Information</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Name</span>
                  <div className="font-medium text-gray-900 dark:text-white">{booking.attendeeInfo?.firstName} {booking.attendeeInfo?.lastName}</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Email</span>
                  <div className="font-medium text-gray-900 dark:text-white">{booking.attendeeInfo?.email}</div>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Tickets</h3>
              {booking.tickets?.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 mb-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{t.ticketType.name}</div>
                    <div className="text-xs text-gray-400">{t.quantity} ticket{t.quantity > 1 ? 's' : ''}</div>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {t.subtotal === 0 ? 'Free' : `$${t.subtotal}`}
                  </div>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-primary-600 dark:text-primary-400">
                  {booking.payment?.amount === 0 ? 'Free' : `$${booking.payment?.amount}`}
                </span>
              </div>
            </div>

            {/* QR Code */}
            {booking.status === 'confirmed' && booking.qrCode && (
              <div className="text-center p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Show this QR code at the venue</p>
                <div className="flex justify-center">
                  <QRCodeSVG value={booking.bookingReference} size={160} />
                </div>
                <p className="text-xs text-gray-400 mt-3 font-mono">{booking.bookingReference}</p>
              </div>
            )}

            {/* Actions */}
            {booking.status !== 'cancelled' && (
              <div className="flex gap-3">
                <button onClick={() => window.print()} className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> Download
                </button>
                {booking.status === 'confirmed' && (
                  <button onClick={() => setCancelModal(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-red-500 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={cancelModal} onClose={() => setCancelModal(false)} onConfirm={handleCancel}
        title="Cancel Booking" message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Cancel Booking" danger loading={cancelling}
      />
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────
export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      notifications: user?.notifications || { email: true, reminders: true, newsletter: false }
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await userAPI.updateProfile(data);
      updateUser(res.user);
      toast.success('Profile updated successfully!');
    } catch (e) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen pb-12">
      <div className="container-custom py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h1>
        <div className="card p-6">
          {/* Avatar */}
          <div className="flex items-center gap-5 pb-6 border-b border-gray-100 dark:border-gray-800 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 capitalize">{user?.role}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input {...register('name', { required: 'Name required' })} className="input pl-10" />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input {...register('phone')} placeholder="+1 (555) 000-0000" className="input pl-10" />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Location</label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...register('location')} placeholder="City, Country" className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="label">Bio</label>
              <textarea {...register('bio')} rows={3} placeholder="Tell us about yourself..."
                className="input resize-none" />
            </div>

            <div>
              <h3 className="label flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h3>
              <div className="space-y-2">
                {[
                  { key: 'email', label: 'Email notifications', desc: 'Booking confirmations and updates' },
                  { key: 'reminders', label: 'Event reminders', desc: 'Get reminded before your events' },
                  { key: 'newsletter', label: 'Newsletter', desc: 'Weekly event recommendations' },
                ].map(n => (
                  <label key={n.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 cursor-pointer">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{n.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{n.desc}</div>
                    </div>
                    <input type="checkbox" {...register(`notifications.${n.key}`)} className="w-4 h-4 accent-primary-600" />
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <><Spinner size="sm" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── SAVED EVENTS PAGE ────────────────────────────────────────
export function SavedEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getSavedEvents().then(r => setEvents(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-20 min-h-screen pb-12">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Saved Events</h1>
        {loading ? <PageSkeleton /> : events.length === 0 ? (
          <EmptyState icon={Bookmark} title="No saved events" description="Bookmark events you're interested in and they'll appear here."
            action={<Link to="/events" className="btn-primary">Browse Events</Link>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => <EventCard key={event._id} event={event} />)}
          </div>
        )}
      </div>
    </div>
  );
}
