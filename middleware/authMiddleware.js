const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // SuperAdmin: skip DB lookup if token says superadmin
    if (decoded.role === 'superadmin') {
      req.user = {
        userId: decoded.userId,
        role: 'superadmin',
        name: decoded.name || 'SuperAdmin',
      };
      return next();
    }

    // Else: lookup admin in DB
    const user = await Admin.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ msg: 'User not found' });

    req.user = {
      userId: user._id,
      role: 'admin',
      name: user.name,
    };

    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
