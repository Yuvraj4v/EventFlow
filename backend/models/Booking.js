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
  // Payment details - FIXED to accept more values
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'razorpay', 'free', 'cash', 'pending', 'Pending', ''],
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
    type: String,
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
  specialRequests: String,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// ─── Virtual: Total amount ───────────────────────────────────
BookingSchema.virtual('totalAmount').get(function() {
  if (!this.tickets || this.tickets.length === 0) return 0;
  return this.tickets.reduce((sum, ticket) => sum + (ticket.subtotal || 0), 0);
});

// ─── Virtual: Total tickets ──────────────────────────────────
BookingSchema.virtual('totalTickets').get(function() {
  if (!this.tickets || this.tickets.length === 0) return 0;
  return this.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
});

// ─── Pre-save hook: Fix payment method ──────────────────────
BookingSchema.pre('save', function(next) {
  // Fix payment method
  const validMethods = ['stripe', 'razorpay', 'free', 'cash'];
  if (!this.payment.method || !validMethods.includes(this.payment.method.toLowerCase())) {
    this.payment.method = 'free';
  } else {
    this.payment.method = this.payment.method.toLowerCase();
  }
  
  // Fix payment status
  const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'partial-refund'];
  if (!this.payment.status || !validStatuses.includes(this.payment.status.toLowerCase())) {
    this.payment.status = 'pending';
  } else {
    this.payment.status = this.payment.status.toLowerCase();
  }
  
  next();
});

// ─── Indexes ─────────────────────────────────────────────────
BookingSchema.index({ user: 1, event: 1 });
BookingSchema.index({ bookingReference: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ 'payment.status': 1 });

module.exports = mongoose.model('Booking', BookingSchema);