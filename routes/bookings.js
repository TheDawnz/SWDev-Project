const express = require('express');
const { createBooking, getMyBookings, getAllBookings, updateBooking, deleteBooking } = require('../controllers/bookings');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createBooking);
router.get('/me', getMyBookings);

// Admin endpoints
router.get('/', authorize('admin'), getAllBookings);
router.put('/:id', updateBooking); // will check ownership/admin in controller
router.delete('/:id', deleteBooking); // will check ownership/admin in controller

module.exports = router;
