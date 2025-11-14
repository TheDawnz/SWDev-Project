const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  return res.status(403).json({ message: 'Admin only' });
};
