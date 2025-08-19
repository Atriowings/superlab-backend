const Admin = require('../models/Admin');
const Staff = require('../models/Staff');
const SuperAdmin = require('../models/SuperAdmin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to generate JWT token with user id and role
const generateToken = (user, role) => {
  return jwt.sign(
    { userId: user._id, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Please fill all fields' });
  }

  // === 1. HARDCODED SUPERADMIN CHECK - goes FIRST ===
  // if (username === "superadmin" && password === "SuperAdmin@123!") {
  //   const fakeUser = {
  //     _id: '000000superadmin',
  //     username: 'superadmin',
  //     name: 'Super Admin',
  //   };
  //   const token = jwt.sign(
  //     { userId: fakeUser._id, role: 'superadmin' },
  //     process.env.JWT_SECRET,
  //     { expiresIn: '7d' }
  //   );
  //   return res.json({
  //     token,
  //     user: {
  //       id: fakeUser._id,
  //       username: fakeUser.username,
  //       role: "superadmin",
  //       name: fakeUser.name,
  //     }
  //   });
  // }


  try {
    let user = null;
    let role = null;

    // === 2. Check Admin by username (case sensitive) ===
    user = await Admin.findOne({ username });
    role = 'admin';

    // === 3. If no admin found, try Staff by staffId (uppercase) ===
    if (!user) {
      const upperUsername = username.toUpperCase();
      user = await Staff.findOne({ staffId: upperUsername });
      role = 'staff';
    }

    // === 4. If still no user, try SuperAdmin (DB, stored lowercase) ===
    if (!user) {
      const lowerUsername = username.toLowerCase();
      user = await SuperAdmin.findOne({ username: lowerUsername });
      role = 'superadmin';
    }

    // === 5. User not found ===
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // === 6. Compare password ===
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // === 7. Generate token and return ===
    const token = generateToken(user, role);

    if (role === 'staff') {
      return res.json({
        token,
        user: {
          id: user._id,
          staffId: user.staffId,
          role,
          name: user.name,
        },
      });
    } else {
      return res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          role,
          name: user.name || '',
        },
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
