const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware'); // your auth middleware path

const {
  assignTask,
  getAllTasks,
  updateTaskStatus,
  getTasksByStaffId,
  getTaskById,
  updateTaskProgress,
  getAllTasksForSuperAdmin,
  verifyTask, // remember to add this to your controller exports
} = require('../controllers/taskController');

// Setup multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder to save uploaded files locally
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Routes

// Assign a new task
router.post('/assign', assignTask);

// Get all tasks
router.get('/list', getAllTasks);

// Update basic status field (Pending, In Progress, Completed)
router.patch('/:id/status', updateTaskStatus);

// Get tasks assigned to a particular staff by their staffId
router.get('/staff/:staffId', getTasksByStaffId);

// Get a single task details by task id
router.get('/:id', getTaskById);

// Update task progress with multiple file uploads support
router.patch(
  '/:id/progress',
  upload.fields([
    { name: 'sampleImages', maxCount: 10 }, // multiple sample images
    { name: 'trForm', maxCount: 1 },         // single TR form upload
    { name: 'photo', maxCount: 1 }           // single photo proof for backward compatibility
  ]),
  updateTaskProgress
);

// *** Protect this route with auth middleware to allow only logged-in admins to verify ***
router.patch('/:id/verify', auth, verifyTask);

router.get('/superadmin/tasks', auth, getAllTasksForSuperAdmin);

module.exports = router;
