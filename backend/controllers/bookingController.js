// ============================================================
// Booking Controller - Handle event registrations
// ============================================================
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { sendEmail } = require('../utils/email');

// ─── @POST /api/bookings ─────────────────────────────────────
exports.createBooking = async (req, res, next) => {
  try {
    const { eventId, tickets, attendeeInfo, specialRequests } = req.body;

    // Get event
    const event = await Event.findById(eventId).populate('category');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'published') return res.status(400).json({ success: false, message: 'Event is not available for booking' });

    // Check if user already booked
    const existingBooking = await Booking.findOne({
      user: req.user.id,
      event: eventId,
      status: { $ne: 'cancelled' }
    });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You already have an active booking for this event' });
    }

    // Validate tickets and calculate total
    let totalAmount = 0;
    const processedTickets = [];

    for (const ticketRequest of tickets) {
      const eventTicket = event.tickets.id(ticketRequest.ticketId);
      if (!eventTicket) return res.status(400).json({ success: false, message: `Ticket type not found` });
      if (!eventTicket.isAvailable) return res.status(400).json({ success: false, message: `${eventTicket.name} tickets are not available` });

      const available = eventTicket.quantity - eventTicket.sold;
      if (available < ticketRequest.quantity) {
        return res.status(400).json({ success: false, message: `Only ${available} ${eventTicket.name} tickets left` });
      }

      if (ticketRequest.quantity > eventTicket.maxPerBooking) {
        return res.status(400).json({ success: false, message: `Maximum ${eventTicket.maxPerBooking} tickets per booking for ${eventTicket.name}` });
      }

      const subtotal = eventTicket.price * ticketRequest.quantity;
      totalAmount += subtotal;

      // Generate individual ticket codes
      const ticketCodes = Array.from({ length: ticketRequest.quantity }, () => 
        'TKT-' + uuidv4().slice(0, 8).toUpperCase()
      );

      processedTickets.push({
        ticketType: {
          ticketId: eventTicket._id,
          name: eventTicket.name,
          price: eventTicket.price
        },
        quantity: ticketRequest.quantity,
        subtotal,
        ticketCodes
      });

      // Update sold count
      eventTicket.sold += ticketRequest.quantity;
    }

    await event.save();

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      event: eventId,
      tickets: processedTickets,
      attendeeInfo,
      specialRequests,
      payment: {
        method: totalAmount === 0 ? 'free' : 'pending',
        status: totalAmount === 0 ? 'completed' : 'pending',
        amount: totalAmount,
        paidAt: totalAmount === 0 ? Date.now() : null
      },
      status: totalAmount === 0 ? 'confirmed' : 'pending'
    });

    // Generate QR code for confirmed bookings
    if (booking.status === 'confirmed') {
      const qrData = JSON.stringify({
        bookingRef: booking.bookingReference,
        eventId: event._id,
        userId: req.user.id,
        timestamp: Date.now()
      });
      booking.qrCode = await QRCode.toDataURL(qrData);
      await booking.save();
    }

    await booking.populate([
      { path: 'event', select: 'title coverImage startDate location' },
      { path: 'user', select: 'name email' }
    ]);

    // Send confirmation email (async, don't block response)
    if (booking.status === 'confirmed') {
      sendBookingConfirmationEmail(booking, event).catch(console.error);
    }

    res.status(201).json({
      success: true,
      message: totalAmount === 0 ? 'Registration successful!' : 'Booking created. Complete payment to confirm.',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/bookings/my ───────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    let query = { user: req.user.id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('event', 'title coverImage startDate endDate location status category')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({ success: true, data: bookings, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/bookings/:id ──────────────────────────────────
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title coverImage startDate endDate location organizer')
      .populate('user', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only booking owner or admin can see it
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/bookings/:id/cancel ───────────────────────────
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Restore ticket inventory
    const event = await Event.findById(booking.event._id);
    if (event) {
      for (const bookedTicket of booking.tickets) {
        const eventTicket = event.tickets.id(bookedTicket.ticketType.ticketId);
        if (eventTicket) {
          eventTicket.sold = Math.max(0, eventTicket.sold - bookedTicket.quantity);
        }
      }
      await event.save();
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: Date.now(),
      reason: req.body.reason || 'Cancelled by user',
      refundAmount: 0,
      refundStatus: 'none'
    };
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    next(error);
  }
};

// ─── Helper: Send confirmation email ─────────────────────────
async function sendBookingConfirmationEmail(booking, event) {
  try {
    await sendEmail({
      email: booking.attendeeInfo.email,
      subject: `Booking Confirmed - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; color: white; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Your spot is reserved</p>
          </div>
          
          <div style="background: white; padding: 24px; border-radius: 12px; margin-bottom: 16px;">
            <h2 style="color: #1f2937; margin-top: 0;">${event.title}</h2>
            <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
            <p><strong>Attendee:</strong> ${booking.attendeeInfo.firstName} ${booking.attendeeInfo.lastName}</p>
            <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Tickets:</strong> ${booking.tickets.map(t => `${t.quantity}x ${t.ticketType.name}`).join(', ')}</p>
          </div>

          ${booking.qrCode ? `
          <div style="text-align: center; background: white; padding: 24px; border-radius: 12px;">
            <p style="color: #6b7280;">Your QR Ticket</p>
            <img src="${booking.qrCode}" alt="QR Code" style="width: 180px; height: 180px;" />
          </div>` : ''}
          
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 24px;">
            Thank you for using EventFlow! We'll see you at the event.
          </p>
        </div>
      `
    });
  } catch (e) {
    console.error('Email send failed:', e.message);
  }
}
