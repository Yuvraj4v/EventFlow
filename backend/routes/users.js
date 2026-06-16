const express = require('express');
const router = express.Router();
const { updateProfile, toggleSaveEvent, getSavedEvents, getDashboardStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.put('/profile', protect, updateProfile);
router.post('/save-event/:eventId', protect, toggleSaveEvent);
router.get('/saved-events', protect, getSavedEvents);
router.get('/dashboard-stats', protect, getDashboardStats);

module.exports = router;
