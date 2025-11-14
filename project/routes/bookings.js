const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const bookingsController = require('../controllers/bookingsController');

router.post('/', protect, bookingsController.createBooking);
router.get('/', protect, bookingsController.getUserBookings);
router.put('/:id', protect, bookingsController.updateBooking);
router.delete('/:id', protect, bookingsController.deleteBooking);

module.exports = router;
