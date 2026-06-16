// ============================================================
// Admin Controller - Admin dashboard and management
// ============================================================
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// ─── @GET /api/admin/stats ───────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalEvents, totalBookings,
      publishedEvents, upcomingEvents,
      revenueData, recentBookings, recentEvents, userGrowth
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Event.countDocuments(),
      Booking.countDocuments(),
      Event.countDocuments({ status: 'published' }),
      Event.countDocuments({ status: 'published', startDate: { $gte: new Date() } }),
      // Total revenue from completed payments
      Booking.aggregate([
        { $match: { 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } }
      ]),
      // Recent bookings
      Booking.find().populate('user', 'name email').populate('event', 'title').sort('-createdAt').limit(10),
      // Recent events
      Event.find().populate('category', 'name').populate('organizer', 'name').sort('-createdAt').limit(5),
      // User growth (last 7 days)
      User.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    // Monthly booking chart data
    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$payment.amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Events by category
    const eventsByCategory = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmpty: true } },
      { $project: { name: { $ifNull: ['$category.name', 'Uncategorized'] }, count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers, totalEvents, totalBookings, publishedEvents,
          upcomingEvents, totalRevenue
        },
        recentBookings,
        recentEvents,
        charts: { monthlyBookings, eventsByCategory, userGrowth }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/admin/users ───────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    let query = {};
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const users = await User.find(query).sort('-createdAt').skip((page-1)*limit).limit(parseInt(limit));
    const total = await User.countDocuments(query);

    res.json({ success: true, data: users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// ─── @PATCH /api/admin/users/:id/role ────────────────────────
exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User role updated', data: user });
  } catch (error) {
    next(error);
  }
};

// ─── @PATCH /api/admin/users/:id/status ──────────────────────
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/admin/bookings ────────────────────────────────
exports.getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, eventId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (eventId) query.event = eventId;

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('event', 'title startDate')
      .sort('-createdAt')
      .skip((page-1)*limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({ success: true, data: bookings, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// ─── @PATCH /api/admin/events/:id/featured ───────────────────
exports.toggleFeatured = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    event.isFeatured = !event.isFeatured;
    await event.save({ validateBeforeSave: false });

    res.json({ success: true, message: `Event ${event.isFeatured ? 'featured' : 'unfeatured'}`, data: event });
  } catch (error) {
    next(error);
  }
};

// ─── @PATCH /api/admin/events/:id/status ─────────────────────
exports.updateEventStatus = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event status updated', data: event });
  } catch (error) {
    next(error);
  }
};
