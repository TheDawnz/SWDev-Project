const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/bookings', protect, admin, adminController.listBookings);
router.put('/bookings/:id', protect, admin, adminController.updateBooking);
router.delete('/bookings/:id', protect, admin, adminController.deleteBooking);

module.exports = router;
