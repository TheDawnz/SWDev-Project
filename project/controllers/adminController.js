const Booking = require('../models/Booking');

exports.listBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user companies');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });
    const { date, companies } = req.body;
    if (date && !Booking.isAllowedDate(date)) return res.status(400).json({ message: 'Date not allowed' });
    booking.date = date || booking.date;
    booking.companies = companies || booking.companies;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });
    await booking.remove();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
