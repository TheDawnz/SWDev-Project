const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sendToken = (user, statusCode, res) => {
	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
	const cookieOptions = { httpOnly: true, expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE||30) * 24*60*60*1000) };
	res.status(statusCode).cookie('token', token, cookieOptions).json({ success: true, token });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
	const { name, tel, email, password } = req.body;
	if (!name || !tel || !email || !password) return res.status(400).json({ success:false, message:'Missing fields' });
	const existing = await User.findOne({ email });
	if (existing) return res.status(400).json({ success:false, message:'Email already in use' });
	const user = await User.create({ name, tel, email, password });
	sendToken(user, 201, res);
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) return res.status(400).json({ success:false, message:'Missing fields' });
	const user = await User.findOne({ email }).select('+password');
	if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success:false, message:'Invalid credentials' });
	sendToken(user, 200, res);
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = (req, res) => {
	res.cookie('token', 'none', { expires: new Date(Date.now() + 5*1000), httpOnly: true });
	res.status(200).json({ success: true });
};