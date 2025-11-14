const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
  const { date, companies } = req.body;
  try {
    if (!Booking.isAllowedDate(date)) return res.status(400).json({ message: 'Date not allowed' });
    const count = await Booking.countDocuments({ user: req.user._id });
    if (count >= 3) return res.status(400).json({ message: 'Maximum 3 bookings allowed' });
    const booking = new Booking({ user: req.user._id, date, companies });
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('companies');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (booking.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
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
    if (booking.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    await booking.remove();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
