// ============================================================
// Booking Model - Event registrations and ticket purchases
// ============================================================
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BookingSchema = new mongoose.Schema({
  // Unique booking reference (shown to users)
  bookingReference: {
    type: String,
    unique: true,
    default: () => 'EVF-' + uuidv4().slice(0, 8).toUpperCase()
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  // Tickets booked (can book multiple types)
  tickets: [{
    ticketType: {
      ticketId: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number
    },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: Number,
    // Individual ticket codes (one per ticket)
    ticketCodes: [String]
  }],
  // Attendee info (may differ from user account)
  attendeeInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    organization: String
  },
  // Payment details
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'razorpay', 'free', 'cash', ''],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'partial-refund', ''],
      default: 'pending'
    },
    transactionId: String,
    stripePaymentIntentId: String,
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    paidAt: Date
  },
  // Booking status
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'attended', 'no-show'],
    default: 'pending'
  },
  // QR Code for ticket verification
  qrCode: {
    type: String, // Base64 encoded QR code image
    default: null
  },
  // Cancellation details
  cancellation: {
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'processed'],
      default: 'none'
    }
  },
  // Check-in
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: Date,
  // Notes
  specialRequests: String,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// ─── Virtual: Total amount ───────────────────────────────────
BookingSchema.virtual('totalAmount').get(function() {
  return this.tickets.reduce((sum, ticket) => sum + (ticket.subtotal || 0), 0);
});

// ─── Virtual: Total tickets ──────────────────────────────────
BookingSchema.virtual('totalTickets').get(function() {
  return this.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
});

// ─── Pre-save hook: Ensure payment method is valid ──────────
BookingSchema.pre('save', function(next) {
  // If payment.method is empty or invalid, set to 'free'
  const validMethods = ['stripe', 'razorpay', 'free', 'cash'];
  if (!this.payment.method || !validMethods.includes(this.payment.method)) {
    this.payment.method = 'free';
  }
  
  // If payment.status is empty or invalid, set to 'pending'
  const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'partial-refund'];
  if (!this.payment.status || !validStatuses.includes(this.payment.status)) {
    this.payment.status = 'pending';
  }
  
  next();
});

// ─── Indexes ─────────────────────────────────────────────────
BookingSchema.index({ user: 1, event: 1 });
BookingSchema.index({ bookingReference: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ 'payment.status': 1 });

module.exports = mongoose.model('Booking', BookingSchema);