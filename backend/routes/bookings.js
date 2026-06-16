// ─── routes/bookings.js ──────────────────────────────────────
const express = require('express');
const bookingRouter = express.Router();
const { createBooking, getMyBookings, getBooking, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

bookingRouter.post('/', protect, createBooking);
bookingRouter.get('/my', protect, getMyBookings);
bookingRouter.get('/:id', protect, getBooking);
bookingRouter.put('/:id/cancel', protect, cancelBooking);

module.exports = bookingRouter;
