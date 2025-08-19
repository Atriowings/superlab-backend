// ✅ You MUST add this at the top of authRoutes.js
const express = require('express');
const router = express.Router(); // <== THIS was missing

const { login } = require('../controllers/authController');
const Admin = require('../models/Admin');

// TEMPORARY: Create Admin
router.post('/create-admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const newAdmin = new Admin({ username, password });
    await newAdmin.save();
    res.json({ msg: 'Admin created', username: newAdmin.username });
  } catch (err) {
    res.status(500).json({ msg: 'Error creating admin', error: err.message });
  }
});

router.post('/login', login);

module.exports = router;
