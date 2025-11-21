const express = require('express');
const { createBooking, getMyBookings, getAllBookings,getBookingById, updateBooking, deleteBooking } = require('../controllers/bookings');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', protect, createBooking);
router.get('/me', protect, getMyBookings);


// Admin endpoints
router.get('/:id', protect, authorize('admin'), getBookingById);
router.get('/',protect, authorize('admin'), getAllBookings);
router.put('/:id', protect, authorize('admin'), updateBooking); // will check ownership/admin in controller
router.delete('/:id', protect, authorize('admin'), deleteBooking); // will check ownership/admin in controller

module.exports = router;
