const Task = require("../models/Task");
const Staff = require("../models/Staff");
const path = require("path");

// ✅ Assign a new task
const assignTask = async (req, res) => {
  try {
    const {
      taskType,
      patientName,
      patientAddress,
      patientLocation,
      sampleType,
      contactNumber,
      assignedStaff,
      date,
    } = req.body;

    const task = new Task({
      taskType,
      patientName,
      patientAddress,
      patientLocation,
      sampleType,
      contactNumber,
      assignedStaff,
      date,
      status: "Pending",
    });

    await task.save();
    res.status(201).json({ msg: "Task assigned successfully" });
  } catch (err) {
    console.error("Error assigning task:", err);
    res.status(500).json({ msg: "Task assignment failed" });
  }
};

// ✅ Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .populate("assignedStaff", "name staffId")
      .populate("verifiedBy", "name staffId"); // include verifiedBy info for frontend

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching all tasks:", err);
    res.status(500).json({ msg: "Failed to fetch tasks" });
  }
};

// ✅ Update status only (basic)
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const updated = await Task.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) return res.status(404).json({ msg: "Task not found" });

    res.json({ msg: "Status updated", task: updated });
  } catch (err) {
    console.error("Error updating task status:", err);
    res.status(500).json({ msg: "Failed to update status" });
  }
};

// ✅ Get tasks for a staff member
const getTasksByStaffId = async (req, res) => {
  const { staffId } = req.params;

  try {
    const staff = await Staff.findOne({ staffId });
    if (!staff) return res.status(404).json({ msg: "Staff not found" });

    const tasks = await Task.find({ assignedStaff: staff._id }).populate(
      "assignedStaff",
      "name staffId"
    );

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching staff tasks:", err);
    res.status(500).json({ msg: "Server error while fetching tasks", error: err.message });
  }
};

// ✅ Get task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id)
      .populate("assignedStaff", "name staffId")
      .populate("verifiedBy", "name staffId"); // populate verifiedBy info

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ NEW: Update task progress + time + optional photo (improved)
const updateTaskProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tubeCount } = req.body;

    const allowedStatuses = ["reached", "collected", "submitted"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status step" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    const now = new Date();

    // Update timestamps and status based on phase
    if (status === "reached") {
      task.reachedAt = now;
      task.status = "In Progress";
    } else if (status === "collected") {
      task.sampleCollectedAt = now;
      // Tube count can be updated only at collected stage
      if (tubeCount !== undefined) {
        // accept number or string number, convert to int
        task.tubeCount = parseInt(tubeCount, 10) || 0;
      }
    } else if (status === "submitted") {
      task.submittedToLabAt = now;
      task.status = "Completed";
    }

    // Handle file uploads
    // req.files is an object: { sampleImages: [...], trForm: [...], photo: [...] }
    if (req.files) {
      // Append new sample images to existing (do not overwrite)
      if (req.files.sampleImages && req.files.sampleImages.length > 0) {
        const imageFilenames = req.files.sampleImages.map((file) => file.filename);
        if (!task.sampleImages) {
          task.sampleImages = [];
        }
        task.sampleImages.push(...imageFilenames);
      }

      // Save TR form filename (single file expected)
      if (req.files.trForm && req.files.trForm.length > 0) {
        task.trForm = req.files.trForm[0].filename;
      }

      // Backward compatibility: if old single photoProof file uploaded
      if (req.files.photo && req.files.photo.length > 0) {
        task.photoProof = req.files.photo[0].filename;
      }
    }

    await task.save();

    res.json({ msg: `Task marked as '${status}'`, task });
  } catch (err) {
    console.error("Progress update failed:", err);
    res.status(500).json({ msg: "Failed to update task progress" });
  }
};

const verifyTask = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.userId; // or req.admin?._id depending on your setup

    if (!adminId) {
      return res.status(401).json({ msg: 'Unauthorized: Admin credentials required' });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    if (task.verified)
      return res.status(400).json({ msg: 'Task already verified' });

    task.verified = true;
    task.verifiedBy = adminId;

    await task.save();

    await task.populate('verifiedBy', 'name staffId');

    res.json({ msg: 'Task verified successfully', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to verify task' });
  }
};

// Get all tasks for superadmin with populated verifiedBy and verified admin
const getAllTasksForSuperAdmin = async (req, res) => {
  try {
    // Ensure only superadmins can access
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
const tasks = await Task.find()
  .populate('assignedStaff', 'name staffId')  // already exists most likely
  .populate('verifiedBy', 'username') // 👈 populate only username of admin
  .sort({ createdAt: -1 });


    res.json(tasks);
  } catch (err) {
    console.error('Failed to fetch tasks for superadmin:', err);
    res.status(500).json({ msg: 'Failed to fetch tasks' });
  }
};


module.exports = {
  assignTask,
  getAllTasks,
  updateTaskStatus,
  getTasksByStaffId,
  getTaskById,
  updateTaskProgress,
  getAllTasksForSuperAdmin,
  verifyTask, // export the new verifyTask controller
};
