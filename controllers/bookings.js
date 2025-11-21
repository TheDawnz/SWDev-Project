const Booking = require('../models/Booking');
const Company = require('../models/Company');

const MIN_DATE = new Date('2022-05-10T00:00:00Z');
const MAX_DATE = new Date('2022-05-13T23:59:59Z');

exports.createBooking = async (req, res) => {
	const userId = req.user._id;
	const { companyId, date } = req.body;
	if (!companyId || !date) return res.status(400).json({ success:false, message:'companyId and date required' });

	const d = new Date(date);
	if (isNaN(d)) return res.status(400).json({ success:false, message:'Invalid date' });
	if (d < MIN_DATE || d > MAX_DATE) return res.status(400).json({ success:false, message:'Date must be between 2022-05-10 and 2022-05-13' });

	const company = await Company.findById(companyId);
	if (!company) return res.status(404).json({ success:false, message:'Company not found' });

	const count = await Booking.countDocuments({ user: userId });
	if (count >= 3) return res.status(400).json({ success:false, message:'Booking limit (3) reached' });

	const booking = await Booking.create({ user: userId, company: companyId, date: d });
	res.status(201).json({ success:true, data: booking });
};

exports.getMyBookings = async (req, res) => {
	const bookings = await Booking.find({ user: req.user._id }).populate('company');
	res.json({ success:true, data: bookings });
};

exports.getAllBookings = async (req, res) => {
	// admin-only usage
	const bookings = await Booking.find().populate('company').populate('user', 'name email tel');
	res.json({ success:true, data: bookings });
};

exports.updateBooking = async (req, res) => {
	const { id } = req.params;
	const { companyId, date } = req.body;
	let booking = await Booking.findById(id);
	if (!booking) return res.status(404).json({ success:false, message:'Not found' });

	// only owner or admin can modify
	if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
		return res.status(403).json({ success:false, message:'Forbidden' });
	}

	if (date) {
		const d = new Date(date);
		if (isNaN(d) || d < MIN_DATE || d > MAX_DATE) return res.status(400).json({ success:false, message:'Invalid date range' });
		booking.date = d;
	}
	if (companyId) {
		const company = await Company.findById(companyId);
		if (!company) return res.status(404).json({ success:false, message:'Company not found' });
		booking.company = companyId;
	}

	await booking.save();
	res.json({ success:true, data: booking });
};

exports.deleteBooking = async (req, res) => {
	const { id } = req.params;
	const booking = await Booking.findById(id);
	if (!booking) return res.status(404).json({ success:false, message:'Not found' });
	if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
		return res.status(403).json({ success:false, message:'Forbidden' });
	}
	await booking.remove();
	res.json({ success:true, message:'Deleted' });
};
