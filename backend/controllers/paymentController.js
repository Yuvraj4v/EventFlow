// ============================================================
// Payment Controller - Stripe integration
// ============================================================
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const QRCode = require('qrcode');

// ─── @POST /api/payments/create-intent ──────────────────────
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('event', 'title');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.payment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Booking already paid' });
    }

    const totalAmount = booking.tickets.reduce((sum, t) => sum + t.subtotal, 0);

    // Create Stripe Payment Intent (amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      metadata: {
        bookingId: booking._id.toString(),
        bookingReference: booking.bookingReference,
        eventTitle: booking.event.title,
        userId: req.user.id
      }
    });

    // Save intent ID to booking
    booking.payment.stripePaymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount
    });
  } catch (error) {
    // Handle Stripe errors gracefully (e.g., in test without valid key)
    if (error.type === 'StripeAuthenticationError' || error.code === 'api_key_expired') {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please add STRIPE_SECRET_KEY to .env'
      });
    }
    next(error);
  }
};

// ─── @POST /api/payments/confirm ─────────────────────────────
exports.confirmPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Verify payment with Stripe
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Could not verify payment' });
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    // Update booking
    booking.payment.status = 'completed';
    booking.payment.transactionId = paymentIntentId;
    booking.payment.method = 'stripe';
    booking.payment.paidAt = Date.now();
    booking.status = 'confirmed';

    // Generate QR code
    const qrData = JSON.stringify({
      bookingRef: booking.bookingReference,
      eventId: booking.event,
      userId: req.user.id
    });
    booking.qrCode = await QRCode.toDataURL(qrData);

    await booking.save();

    res.json({ success: true, message: 'Payment confirmed! Your booking is confirmed.', data: booking });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/payments/webhook ────────────────────────────
// Stripe calls this endpoint to notify of payment events
exports.webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const booking = await Booking.findById(paymentIntent.metadata.bookingId);
      if (booking && booking.payment.status !== 'completed') {
        booking.payment.status = 'completed';
        booking.payment.paidAt = Date.now();
        booking.status = 'confirmed';
        await booking.save();
      }
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      await Booking.findByIdAndUpdate(failedIntent.metadata.bookingId, {
        'payment.status': 'failed'
      });
      break;
  }

  res.json({ received: true });
};
