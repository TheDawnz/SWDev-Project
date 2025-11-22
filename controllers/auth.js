const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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
	console.log(req.body);
	const { name, tel, email, password } = req.body;
	if (!name || !tel || !email || !password) return res.status(400).json({ success:false, message:'Missing fields' });
	const existing = await User.findOne({ $or: [{ email }, { tel }] });
	if (existing) {
		if (existing.email === email) return res.status(400).json({ success:false, message:'Email already in use' });
		if (existing.tel === tel) return res.status(400).json({ success:false, message:'Telephone already in use' });
		// fallback
		return res.status(400).json({ success:false, message:'User already exists' });
	}
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

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user:process.env.MY_EMAIL,
    pass:process.env.MY_PASSWORD
  }
});
// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
	const { email } = req.body;
	if (!email) return res.status(400).json({ success:false, message:'Email required' });
	const user = await User.findOne({ email });
	if (!user) return res.status(404).json({ success:false, message:'No user with that email' });
	// Generate OTP
	const OTP = Math.floor(100000 + Math.random() * 900000).toString();
	user.resetPasswordToken = OTP;
	user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
	await user.save();
    try {
    // Create reset URL
    const mail_configs = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER || process.env.MY_EMAIL,
      to: email,
      subject: "PASSWORD RECOVERY",
      html: `<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>CodePen - OTP Email Template</title>
  

</head>
<body>
<!-- partial:index.partial.html -->
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Test Recovery</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;"><br /></p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
    };

    const info = await transporter.sendMail(mail_configs);
    // Log info for debugging
    console.log('sendMail info:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    });
    // For Ethereal/dev we can return preview URL
    const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    return res.json({ success: true, message: 'Email sent', info: { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected }, preview });
    } catch (err) {
      console.error('Forgot password sendMail error:', err);
      try { await User.updateOne({ email }, { $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 } }); } catch (e) {}
      return res.status(500).json({ success:false, message: 'Failed to send email' });
    }
}

// Reset password (using OTP)
// @route   PUT /api/v1/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) return res.status(400).json({ success:false, message: 'email, otp and password are required' });
  try {
    const user = await User.findOne({ email }).select('+password resetPasswordToken resetPasswordExpire');
    if (!user) return res.status(404).json({ success:false, message: 'User not found' });
    if (!user.resetPasswordToken || !user.resetPasswordExpire) return res.status(400).json({ success:false, message: 'No reset request found' });
    if (user.resetPasswordExpire < Date.now()) return res.status(400).json({ success:false, message: 'OTP expired' });
    if (user.resetPasswordToken !== otp) return res.status(400).json({ success:false, message: 'Invalid OTP' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Return auth token after reset
    sendToken(user, 200, res);
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success:false, message: err.message || 'Server error' });
  }
};
