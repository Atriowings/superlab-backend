const Staff = require('../models/Staff');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');

// Create Staff
exports.createStaff = async (req, res) => {
  try {
    const { name, staffId, password, contactNumber, department } = req.body;

    if (!name || !staffId || !password) {
      return res.status(400).json({ msg: 'Name, Staff ID, and Password are required' });
    }

    const existing = await Staff.findOne({ staffId });
    if (existing) {
      return res.status(400).json({ msg: 'Staff ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = new Staff({
      name,
      staffId,
      password: hashedPassword,
      contactNumber,
      department
    });

    await newStaff.save();
    res.status(201).json({ msg: 'Staff created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to create staff' });
  }
};

// ✅ Get all staff with task summary (updated to include full completedTasks)
exports.getAllStaffWithTasks = async (req, res) => {
  try {
    const staffList = await Staff.find({}, '-password').lean(); // exclude passwords

    const enrichedStaff = await Promise.all(
      staffList.map(async (staff) => {
        const currentTask = await Task.findOne({
          assignedStaff: staff._id,
          status: { $ne: 'Completed' }
        }).lean();

        const completedTasks = await Task.find({
          assignedStaff: staff._id,
          status: 'Completed'
        })
          .sort({ date: -1 }) // latest first
          .select('taskType sampleType date')
          .lean();

        return {
          ...staff,
          currentTask,
          completedTasks,
        };
      })
    );

    res.json(enrichedStaff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch staff list' });
  }
};

// Delete Staff
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ msg: 'Staff not found' });
    }
    res.json({ msg: 'Staff deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to delete staff' });
  }
};
