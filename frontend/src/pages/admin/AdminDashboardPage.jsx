import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, Calendar, Ticket, DollarSign, TrendingUp, ArrowRight, Shield, Eye, Star } from 'lucide-react';
import { format } from 'date-fns';
import { adminAPI } from '../../services/api';
import { StatusBadge, Spinner } from '../../components/common/UI';
import AdminLayout from './AdminLayout';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
    </AdminLayout>
  );

  const { stats, recentBookings, recentEvents, charts } = data || {};

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers?.toLocaleString(), change: '+12%', color: 'from-blue-500 to-blue-600' },
    { icon: Calendar, label: 'Total Events', value: stats?.totalEvents?.toLocaleString(), change: '+5%', color: 'from-violet-500 to-violet-600' },
    { icon: Ticket, label: 'Total Bookings', value: stats?.totalBookings?.toLocaleString(), change: '+18%', color: 'from-pink-500 to-pink-600' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, change: '+23%', color: 'from-emerald-500 to-emerald-600' },
  ];

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = charts?.monthlyBookings?.map(d => ({
    month: MONTHS[(d._id.month || 1) - 1],
    bookings: d.count,
    revenue: d.revenue || 0
  })) || [];

  const pieData = charts?.eventsByCategory?.map(d => ({ name: d.name, value: d.count })) || [];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl bg-gradient-to-br p-px overflow-hidden shadow-sm" style={{ backgroundImage: `linear-gradient(135deg, ${card.color.split(' ')[1]}, ${card.color.split(' ')[3]})` }}>
            <div className="bg-white dark:bg-gray-900 rounded-[14px] p-5 h-full">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
                <span className="text-xs text-emerald-500 font-medium flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />{card.change}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Bookings chart */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Monthly Bookings & Revenue</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="bookings" fill="#6366f1" radius={[6, 6, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet — seed the database first</div>
          )}
        </div>

        {/* Category pie */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Events by Category</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {pieData.slice(0, 4).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[100px]">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No categories yet</div>
          )}
        </div>
      </div>

      {/* Recent bookings + events */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-sm text-primary-500 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {(recentBookings || []).slice(0, 6).map(b => (
              <div key={b._id} className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {b.user?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{b.user?.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{b.event?.title}</div>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
            {(!recentBookings || recentBookings.length === 0) && (
              <div className="p-8 text-center text-sm text-gray-400">No bookings yet</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Events</h3>
            <Link to="/admin/events" className="text-sm text-primary-500 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {(recentEvents || []).map(e => (
              <div key={e._id} className="flex items-center gap-3 p-4">
                {e.coverImage ? (
                  <img src={e.coverImage} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-lg">🎉</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{e.category?.name} • {e.organizer?.name}</div>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
            {(!recentEvents || recentEvents.length === 0) && (
              <div className="p-8 text-center text-sm text-gray-400">No events yet</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
