// routes/superadminRoutes.js
const express = require('express');
const router = express.Router();
const SuperAdmin = require('../models/SuperAdmin');

// Create SuperAdmin (ONLY FOR INITIAL SETUP — REMOVE IN PROD)
router.post('/create', async (req, res) => {
  try {
    const { username, password, name, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password are required' });
    }

    const existing = await SuperAdmin.findOne({ username });
    if (existing) {
      return res.status(400).json({ msg: 'SuperAdmin already exists' });
    }

    const newSuperAdmin = new SuperAdmin({ username, password, name, email });
    await newSuperAdmin.save();

    res.status(201).json({ msg: 'SuperAdmin created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to create SuperAdmin', error: err.message });
  }
});

module.exports = router;
