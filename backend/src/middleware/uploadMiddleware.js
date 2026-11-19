import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanName}-${Date.now()}${ext}`);
  },
});

// File validation filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mime)) {
    return cb(null, true);
  }

  const err = new Error('Only JPG, JPEG, PNG, and WEBP formats are supported.');
  err.code = 'INVALID_FILE_TYPE';
  return cb(err, false);
};

// 50 MB Maximum Size
export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 Megabytes
  },
  fileFilter,
});

// Express middleware wrapper to catch multer errors cleanly
export const handleUploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image size must not exceed 50 MB.',
        });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          message: 'Only JPG, JPEG, PNG, and WEBP formats are supported.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload validation failed.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please select an image.',
      });
    }

    next();
  });
};
