const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    // Set permissions if needed
    fs.chmodSync(dirPath, 0o755);
  }
};

// Set up storage for profile images
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Make sure this path is correct - use an absolute path
    const uploadDir = path.resolve(__dirname, '../../uploads/profiles');
    console.log('Upload directory:', uploadDir);
    createDirIfNotExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Create the multer upload middleware
const profileUpload = multer({ 
  storage: profileStorage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

module.exports = {
  profileUpload
};