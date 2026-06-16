// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, updatePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/update-password', protect, updatePassword);
router.get('/me', protect, getMe);

module.exports = router;
