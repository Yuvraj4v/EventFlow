// ============================================================
// User Controller - Profile management
// ============================================================
const User = require('../models/User');
const Booking = require('../models/Booking');

// ─── @PUT /api/users/profile ─────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'bio', 'location', 'notifications', 'avatar'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/users/save-event/:eventId ────────────────────
exports.toggleSaveEvent = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.eventId;

    const isSaved = user.savedEvents.includes(eventId);

    if (isSaved) {
      user.savedEvents = user.savedEvents.filter(id => id.toString() !== eventId);
    } else {
      user.savedEvents.push(eventId);
    }

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: isSaved ? 'Event removed from saved' : 'Event saved successfully',
      isSaved: !isSaved
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/users/saved-events ────────────────────────────
exports.getSavedEvents = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedEvents',
      populate: { path: 'category', select: 'name icon color' }
    });

    res.json({ success: true, data: user.savedEvents });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/users/dashboard-stats ─────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [totalBookings, upcomingBookings, attendedBookings, savedCount] = await Promise.all([
      Booking.countDocuments({ user: userId }),
      Booking.countDocuments({ user: userId, status: 'confirmed' }),
      Booking.countDocuments({ user: userId, status: 'attended' }),
      User.findById(userId).select('savedEvents').then(u => u.savedEvents.length)
    ]);

    const recentBookings = await Booking.find({ user: userId })
      .populate('event', 'title coverImage startDate location')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      stats: { totalBookings, upcomingBookings, attendedBookings, savedCount },
      recentBookings
    });
  } catch (error) {
    next(error);
  }
};
