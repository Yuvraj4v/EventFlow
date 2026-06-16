// ============================================================
// Event Controller - CRUD + filtering for events
// ============================================================
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { AppError } = require('../middleware/errorHandler');

// ─── @GET /api/events ────────────────────────────────────────
exports.getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-startDate',
      category,
      city,
      country,
      status = 'published',
      isFree,
      isFeatured,
      search,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      locationType
    } = req.query;

    // Build query object
    let query = {};

    // Status filter (default published for public)
    if (status) query.status = status;

    // Category filter
    if (category) query.category = category;

    // Location filters
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (country) query['location.country'] = new RegExp(country, 'i');
    if (locationType) query['location.type'] = locationType;

    // Free events
    if (isFree !== undefined) query.isFree = isFree === 'true';

    // Featured events
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

    // Date range filter
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Price range (filter on ticket prices)
    if (minPrice || maxPrice) {
      query['tickets.price'] = {};
      if (minPrice) query['tickets.price'].$gte = Number(minPrice);
      if (maxPrice) query['tickets.price'].$lte = Number(maxPrice);
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const events = await Event.find(query)
      .populate('category', 'name slug icon color')
      .populate('organizer', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(); // .lean() for faster queries

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasMore: pageNum < Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/events/:id ────────────────────────────────────
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('category', 'name slug icon color')
      .populate('organizer', 'name avatar bio');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Increment views (fire and forget)
    Event.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/events/slug/:slug ─────────────────────────────
exports.getEventBySlug = async (req, res, next) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug })
      .populate('category', 'name slug icon color')
      .populate('organizer', 'name avatar bio');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    Event.findByIdAndUpdate(event._id, { $inc: { views: 1 } }).exec();

    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/events ───────────────────────────────────────
exports.createEvent = async (req, res, next) => {
  try {
    req.body.organizer = req.user.id;

    const event = await Event.create(req.body);
    await event.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/events/:id ────────────────────────────────────
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Only organizer or admin can edit
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    res.json({ success: true, message: 'Event updated successfully!', data: event });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/events/:id ─────────────────────────────────
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/events/featured ───────────────────────────────
exports.getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ isFeatured: true, status: 'published' })
      .populate('category', 'name slug icon color')
      .populate('organizer', 'name avatar')
      .sort('-startDate')
      .limit(6)
      .lean();

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/events/:id/similar ────────────────────────────
exports.getSimilarEvents = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const similar = await Event.find({
      _id: { $ne: event._id },
      category: event.category,
      status: 'published',
      startDate: { $gte: new Date() }
    })
      .populate('category', 'name slug icon color')
      .limit(4)
      .lean();

    res.json({ success: true, data: similar });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/events/stats ──────────────────────────────────
exports.getEventStats = async (req, res, next) => {
  try {
    const stats = await Event.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          avgViews: { $avg: '$views' },
          totalViews: { $sum: '$views' },
          upcomingEvents: {
            $sum: { $cond: [{ $gte: ['$startDate', new Date()] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({ success: true, data: stats[0] || {} });
  } catch (error) {
    next(error);
  }
};
