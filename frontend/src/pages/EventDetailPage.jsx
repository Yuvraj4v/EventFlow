import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Users, Tag, Share2, Bookmark, BookmarkCheck,
  ExternalLink, Wifi, ChevronRight, ArrowLeft, Star, AlertCircle, Ticket
} from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { eventAPI, bookingAPI, userAPI } from '../services/api';
import useAuthStore from '../context/authStore';
import CountdownTimer from '../components/events/CountdownTimer';
import EventCard from '../components/events/EventCard';
import { StatusBadge, Modal, Spinner } from '../components/common/UI';
import { EventCardSkeleton } from '../components/common/LoadingSkeleton';

export default function EventDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, toggleSavedEvent } = useAuthStore();

  const [event, setEvent] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [booking, setBooking] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const isSaved = user?.savedEvents?.some(id => (id?._id || id) === event?._id);

  useEffect(() => {
    setLoading(true);
    eventAPI.getBySlug(slug).then(r => {
      setEvent(r.data.data);
      const init = {};
      r.data.data.tickets?.forEach(t => { init[t._id] = 0; });
      setSelectedTickets(init);
      return eventAPI.getSimilar(r.data.data._id);
    }).then(r => setSimilar(r.data.data))
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error('Please login to save events'); return; }
    await userAPI.toggleSaveEvent(event._id);
    toggleSavedEvent(event._id);
    toast.success(isSaved ? 'Removed from saved' : 'Event saved!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);
  const totalPrice = event?.tickets?.reduce((sum, t) => sum + (selectedTickets[t._id] || 0) * t.price, 0) || 0;

  const handleBook = () => {
    if (!isAuthenticated) { toast.error('Please login to book events'); navigate('/login'); return; }
    if (totalTickets === 0) { toast.error('Please select at least one ticket'); return; }
    setConfirmModal(true);
  };

  const confirmBooking = async () => {
    setBookingLoading(true);
    try {
      const tickets = event.tickets
        .filter(t => selectedTickets[t._id] > 0)
        .map(t => ({ ticketId: t._id, quantity: selectedTickets[t._id] }));

      const { data } = await bookingAPI.create({
        eventId: event._id,
        tickets,
        attendeeInfo: {
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ').slice(1).join(' ') || '-',
          email: user.email,
          phone: user.phone || ''
        }
      });
      setBooking(data.data);
      setConfirmModal(false);
      setBookingModal(true);
      toast.success('Booking confirmed! 🎉');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="pt-20 container-custom py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton rounded-2xl aspect-video w-full" />
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
        <div className="skeleton rounded-2xl h-96" />
      </div>
    </div>
  );

  if (!event) return null;

  const isOnline = event.location?.type === 'online';
  const isPast = new Date(event.startDate) < new Date();
  const isSoldOut = event.tickets?.every(t => t.sold >= t.quantity);
  const allImages = event.coverImage ? [event.coverImage, ...(event.images?.map(i => i.url) || [])] : [];

  return (
    <div className="pt-20 pb-16 min-h-screen page-enter">
      <div className="container-custom py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/events" className="hover:text-primary-500 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Events
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 dark:text-white truncate">{event.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── Left: Event Info ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video relative">
              {allImages.length > 0 ? (
                <>
                  <img src={allImages[activeImage]} alt={event.title} className="w-full h-full object-cover" />
                  {allImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, i) => (
                        <button key={i} onClick={() => setActiveImage(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? 'bg-white w-4' : 'bg-white/50'}`} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  {event.category?.icon || '🎉'}
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {event.isFeatured && <span className="badge bg-amber-400 text-amber-900">⭐ Featured</span>}
                <StatusBadge status={event.status} />
              </div>
            </div>

            {/* Title & Actions */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{event.title}</h1>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={handleSave} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    {isSaved ? <BookmarkCheck className="w-5 h-5 text-primary-500" /> : <Bookmark className="w-5 h-5 text-gray-400" />}
                  </button>
                  <button onClick={handleShare} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {event.category && (
                <Link to={`/events?category=${event.category._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{ backgroundColor: (event.category.color || '#6366f1') + '20', color: event.category.color || '#6366f1' }}>
                  {event.category.icon} {event.category.name}
                </Link>
              )}

              {/* Key details */}
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <Calendar className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {format(new Date(event.startDate), 'EEE, MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <Clock className="w-5 h-5 text-violet-500 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {event.startTime || format(new Date(event.startDate), 'h:mm a')}
                      {event.endTime && ` – ${event.endTime}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  {isOnline ? <Wifi className="w-5 h-5 text-blue-500 flex-shrink-0" /> : <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0" />}
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{isOnline ? 'Platform' : 'Location'}</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {isOnline ? event.location?.onlinePlatform || 'Online' : `${event.location?.venue || event.location?.city || 'TBA'}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <Users className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Capacity</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {event.tickets?.reduce((s, t) => s + t.quantity, 0) || '—'} total spots
                    </div>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              {!isPast && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mb-6">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Event starts in</p>
                  <CountdownTimer targetDate={event.startDate} />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About this Event</h2>
              <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                {event.description}
              </div>
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(tag => (
                    <Link key={tag} to={`/events?search=${tag}`}
                      className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-600 transition-colors">
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Online link */}
            {isOnline && event.location?.onlineLink && (
              <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold text-sm mb-1">
                  <Wifi className="w-4 h-4" /> Online Event
                </div>
                <a href={event.location.onlineLink} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center gap-1">
                  {event.location.onlineLink} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Map placeholder for physical events */}
            {!isOnline && event.location?.address && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Location</h3>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{event.location.venue}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {[event.location.address, event.location.city, event.location.state, event.location.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Organizer */}
            {event.organizer && (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Organized by</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold">
                    {event.organizer.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{event.organizer.name}</div>
                    {event.organizer.bio && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.organizer.bio}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Right: Booking Sidebar ───────────────────────── */}
          <div className="space-y-4">
            <div className="sticky top-24">
              <div className="card p-6">
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {event.isFree ? (
                      <span className="text-emerald-500">Free Event</span>
                    ) : (
                      <>From <span className="text-primary-600">${event.tickets?.[0]?.price || 0}</span></>
                    )}
                  </div>
                  {isSoldOut && <div className="text-red-500 text-sm font-medium flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Sold Out</div>}
                  {isPast && <div className="text-gray-400 text-sm">This event has ended</div>}
                </div>

                {/* Ticket selection */}
                {!isPast && !isSoldOut && event.tickets?.map(ticket => {
                  const available = ticket.quantity - ticket.sold;
                  return (
                    <div key={ticket._id} className="mb-4 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-sm text-gray-900 dark:text-white">{ticket.name}</div>
                          {ticket.description && <div className="text-xs text-gray-500 dark:text-gray-400">{ticket.description}</div>}
                          <div className="text-xs text-gray-400 mt-1">{available} left</div>
                        </div>
                        <div className="font-bold text-primary-600 dark:text-primary-400">
                          {ticket.price === 0 ? 'Free' : `$${ticket.price}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedTickets(s => ({ ...s, [ticket._id]: Math.max(0, (s[ticket._id] || 0) - 1) }))}
                          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors">
                          −
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900 dark:text-white tabular-nums">
                          {selectedTickets[ticket._id] || 0}
                        </span>
                        <button
                          onClick={() => setSelectedTickets(s => ({ ...s, [ticket._id]: Math.min(ticket.maxPerBooking, available, (s[ticket._id] || 0) + 1) }))}
                          className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-200 transition-colors">
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Total */}
                {totalTickets > 0 && (
                  <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700 mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{totalPrice === 0 ? 'Free' : `$${totalPrice}`}</span>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  disabled={isPast || isSoldOut || totalTickets === 0}
                  className="btn-primary w-full text-center disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Ticket className="w-4 h-4" />
                  {isPast ? 'Event Ended' : isSoldOut ? 'Sold Out' : 'Reserve Tickets'}
                </button>

                {!isAuthenticated && (
                  <p className="text-xs text-center text-gray-400 mt-2">
                    <Link to="/login" className="text-primary-500 hover:underline">Sign in</Link> to book
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Events */}
        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Similar Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similar.map(e => <EventCard key={e._id} event={e} />)}
            </div>
          </div>
        )}
      </div>

      {/* Confirm booking modal */}
      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Confirm Booking" size="sm">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="font-semibold text-gray-900 dark:text-white mb-2">{event.title}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(event.startDate), 'EEE, MMM d, yyyy')}</div>
          </div>
          {event.tickets?.filter(t => (selectedTickets[t._id] || 0) > 0).map(t => (
            <div key={t._id} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{selectedTickets[t._id]}x {t.name}</span>
              <span className="font-semibold">{t.price === 0 ? 'Free' : `$${t.price * selectedTickets[t._id]}`}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t border-gray-100 dark:border-gray-700 pt-3">
            <span>Total</span>
            <span className="text-primary-600">{totalPrice === 0 ? 'Free' : `$${totalPrice}`}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setConfirmModal(false)} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={confirmBooking} disabled={bookingLoading} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {bookingLoading ? <><Spinner size="sm" /> Processing...</> : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Booking success modal */}
      <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Booking Confirmed! 🎉" size="md">
        {booking && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <span className="text-3xl">✅</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{event.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ref: {booking.bookingReference}</p>
            </div>
            {booking.qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-xl border border-gray-100">
                <QRCodeSVG value={booking.bookingReference} size={150} />
              </div>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">A confirmation email has been sent to your email address.</p>
            <div className="flex gap-3">
              <button onClick={() => setBookingModal(false)} className="flex-1 btn-secondary">Close</button>
              <button onClick={() => navigate('/bookings')} className="flex-1 btn-primary">View Bookings</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
