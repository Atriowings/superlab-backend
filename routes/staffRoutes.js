const express = require('express');
const router = express.Router();

const {
  createStaff,
  getAllStaffWithTasks,
  deleteStaff
} = require('../controllers/staffController');

// @route   POST /api/staff/create
// @desc    Create a new staff
router.post('/create', createStaff);

// @route   GET /api/staff/list
// @desc    Get all staff with task summaries (current + completed)
router.get('/list', getAllStaffWithTasks);

// @route   DELETE /api/staff/delete/:id
// @desc    Delete staff by ID
router.delete('/delete/:id', deleteStaff);

module.exports = router;
