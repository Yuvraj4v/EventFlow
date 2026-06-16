// ============================================================
// Event Model - Core event data structure
// ============================================================
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Event category is required']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Event images
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  coverImage: {
    type: String,
    default: null
  },
  // Date and time
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  startTime: String,
  endTime: String,
  timezone: {
    type: String,
    default: 'UTC'
  },
  // Location
  location: {
    type: {
      type: String,
      enum: ['physical', 'online', 'hybrid'],
      default: 'physical'
    },
    venue: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    // For Google Maps
    coordinates: {
      lat: Number,
      lng: Number
    },
    // For online events
    onlineLink: String,
    onlinePlatform: String // Zoom, Teams, etc.
  },
  // Ticketing
  tickets: [{
    name: { type: String, required: true }, // e.g., "General", "VIP", "Early Bird"
    description: String,
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    sold: { type: Number, default: 0 },
    maxPerBooking: { type: Number, default: 10 },
    isAvailable: { type: Boolean, default: true },
    saleStartDate: Date,
    saleEndDate: Date
  }],
  // Event status
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed', 'postponed'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: false
  },
  // Tags for search
  tags: [String],
  // Stats
  views: {
    type: Number,
    default: 0
  },
  // For age restriction
  ageRestriction: {
    hasRestriction: { type: Boolean, default: false },
    minimumAge: Number
  },
  // Cancellation policy
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict', 'no-refund'],
    default: 'moderate'
  },
  refundDeadline: Date,
  // Additional info
  dresscode: String,
  additionalInfo: String,
  // Social sharing
  website: String,
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ─── Virtual Fields ─────────────────────────────────────────

// Calculate total capacity
EventSchema.virtual('totalCapacity').get(function() {
  return this.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
});

// Calculate total sold
EventSchema.virtual('totalSold').get(function() {
  return this.tickets.reduce((sum, ticket) => sum + ticket.sold, 0);
});

// Check if event is sold out
EventSchema.virtual('isSoldOut').get(function() {
  return this.tickets.every(ticket => ticket.sold >= ticket.quantity);
});

// Get minimum price
EventSchema.virtual('minPrice').get(function() {
  if (this.isFree || this.tickets.length === 0) return 0;
  return Math.min(...this.tickets.map(t => t.price));
});

// Get max price
EventSchema.virtual('maxPrice').get(function() {
  if (this.isFree || this.tickets.length === 0) return 0;
  return Math.max(...this.tickets.map(t => t.price));
});

// ─── Indexes for fast querying ──────────────────────────────
EventSchema.index({ title: 'text', description: 'text', tags: 'text' });
EventSchema.index({ startDate: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ 'location.city': 1 });
EventSchema.index({ isFeatured: 1 });
EventSchema.index({ slug: 1 });

// ─── Pre-save: Generate slug ─────────────────────────────────
EventSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Event', EventSchema);
