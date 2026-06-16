const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getUsers, updateUserRole, toggleUserStatus,
  getAllBookings, toggleFeatured, updateEventStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/bookings', getAllBookings);
router.patch('/events/:id/featured', toggleFeatured);
router.patch('/events/:id/status', updateEventStatus);

module.exports = router;
