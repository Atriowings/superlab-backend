const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directory where uploads will be stored
const uploadDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists, create it if not
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(ext, '') // remove original ext
      .toLowerCase()
      .split(' ')
      .join('-'); // sanitize spaces if you want

    cb(null, 'task_' + uniqueSuffix + ext);
  },
});

// Optional file filter (uncomment if you want to restrict files)
// const fileFilter = (req, file, cb) => {
//   // Accept images and pdf/doc files only
//   const allowedMimeTypes = [
//     'image/jpeg',
//     'image/png',
//     'image/jpg',
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
//   ];

//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Unsupported file type'), false);
//   }
// };

// Multer upload instance
const upload = multer({
  storage,
  // fileFilter, // enable this if you want filtering
  // limits: { fileSize: 5 * 1024 * 1024 }, // optional max file size 5MB
});

module.exports = upload;
