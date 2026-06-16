const express = require('express');
const router = express.Router();
const {
  getEvents, getEvent, getEventBySlug, createEvent, updateEvent,
  deleteEvent, getFeaturedEvents, getSimilarEvents, getEventStats
} = require('../controllers/eventController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/stats', getEventStats);
router.get('/slug/:slug', getEventBySlug);
router.get('/:id', getEvent);
router.get('/:id/similar', getSimilarEvents);
router.post('/', protect, authorize('admin', 'organizer'), createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
