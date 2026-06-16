// ============================================================
// HomePage - Full landing page
// ============================================================
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ArrowRight, Star, Users, Calendar, MapPin,
  Zap, Shield, Sparkles, ChevronRight, Play, TrendingUp
} from 'lucide-react';
import EventCard from '../components/events/EventCard';
import { eventAPI, categoryAPI } from '../services/api';
import { EventCardSkeleton } from '../components/common/LoadingSkeleton';

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Event Organizer', avatar: 'SC', text: 'EventFlow transformed how I manage my events. The booking system is seamless and attendees love the experience.', rating: 5 },
  { name: 'Marcus Johnson', role: 'Regular Attendee', avatar: 'MJ', text: 'I\'ve discovered so many amazing local events through EventFlow. The search and filter tools are incredibly powerful.', rating: 5 },
  { name: 'Priya Sharma', role: 'Conference Director', avatar: 'PS', text: 'Managing 500+ attendees used to be a nightmare. EventFlow\'s admin dashboard made it effortless.', rating: 5 },
];

const STATS = [
  { icon: Calendar, value: '50K+', label: 'Events Listed', color: 'text-violet-500' },
  { icon: Users, value: '2M+', label: 'Happy Attendees', color: 'text-pink-500' },
  { icon: MapPin, value: '150+', label: 'Cities Covered', color: 'text-cyan-500' },
  { icon: Star, value: '4.9', label: 'Average Rating', color: 'text-amber-500' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      eventAPI.getFeatured(),
      categoryAPI.getAll()
    ]).then(([eventsRes, catsRes]) => {
      setFeaturedEvents(eventsRes.data.data);
      setCategories(catsRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="page-enter">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-primary-950/30 to-gray-950" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary-900/10 blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="container-custom relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                The #1 Event Discovery Platform
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
                Discover Events
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-violet-400 to-pink-400">
                  Worth Experiencing
                </span>
              </h1>

              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                From intimate workshops to massive festivals — find, book, and experience
                the events that matter to you. All in one place.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search events, concerts, conferences..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <button type="submit" className="px-6 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-2xl transition-all hover:shadow-lg hover:shadow-primary-500/30 flex items-center gap-2">
                  Search <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick search pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="text-xs text-gray-500">Popular:</span>
                {['Music Festival', 'Tech Conference', 'Yoga Retreat', 'Food Festival'].map(term => (
                  <button
                    key={term}
                    onClick={() => navigate(`/events?search=${encodeURIComponent(term)}`)}
                    className="px-3 py-1 rounded-full text-xs text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-gray-500">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-gray-700 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-primary-400 rounded-full"
            />
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3`} />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ────────────────────────────────────────── */}
      <section className="py-20 container-custom">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-950/50 px-3 py-1 rounded-full mb-3">Browse by Category</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Find Your Vibe</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {(loading ? Array(8).fill(null) : categories.slice(0, 8)).map((cat, i) => (
            cat ? (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={`/events?category=${cat._id}`}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg transition-all group"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: (cat.color || '#6366f1') + '20' }}
                  >
                    {cat.icon}
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{cat.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{cat.eventCount || 0} events</div>
                  </div>
                </Link>
              </motion.div>
            ) : (
              <div key={i} className="skeleton rounded-2xl h-32" />
            )
          ))}
        </div>
      </section>

      {/* ─── FEATURED EVENTS ────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-950/50 px-3 py-1 rounded-full mb-3">Handpicked for You</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Featured Events</h2>
            </div>
            <Link to="/events?isFeatured=true" className="btn-outline text-sm hidden md:flex items-center gap-2">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array(6).fill(null).map((_, i) => <EventCardSkeleton key={i} />)
              : featuredEvents.map(event => <EventCard key={event._id} event={event} />)
            }
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link to="/events" className="btn-primary inline-flex items-center gap-2">
              Browse All Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="py-20 container-custom">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-950/50 px-3 py-1 rounded-full mb-3">Simple Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">How EventFlow Works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-px bg-gradient-to-r from-primary-200 to-violet-200 dark:from-primary-800 dark:to-violet-800" />
          {[
            { step: '01', icon: '🔍', title: 'Discover Events', desc: 'Browse thousands of events by category, location, or date. Use powerful filters to find exactly what you\'re looking for.' },
            { step: '02', icon: '🎟️', title: 'Book Your Tickets', desc: 'Secure your spot with our seamless checkout. Get instant confirmation and a QR code ticket sent to your email.' },
            { step: '03', icon: '🎉', title: 'Enjoy the Experience', desc: 'Show your QR code at the door and enjoy! Rate and review events to help others discover great experiences.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="relative text-center p-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-950 dark:to-violet-950 border border-primary-100 dark:border-primary-900 flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm">
                {item.icon}
              </div>
              <div className="absolute top-6 right-6 text-xs font-mono font-bold text-primary-300 dark:text-primary-700">{item.step}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-950/50 px-3 py-1 rounded-full mb-3">Loved By Thousands</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">What People Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array(t.rating).fill(null).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────── */}
      <section className="py-20 container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-800 p-12 md:p-16 text-center"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-violet-500/10 blur-2xl" />
          </div>
          <div className="relative z-10">
            <div className="text-5xl mb-6">🎉</div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to Experience More?</h2>
            <p className="text-primary-200 text-lg mb-8 max-w-xl mx-auto">
              Join over 2 million people discovering amazing events every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-primary-50 transition-colors shadow-xl inline-flex items-center gap-2">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/events" className="px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-colors border border-white/20 inline-flex items-center gap-2">
                Browse Events
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
