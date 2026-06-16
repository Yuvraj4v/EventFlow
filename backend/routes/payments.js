const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment, webhookHandler } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Stripe webhook needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);

module.exports = router;
