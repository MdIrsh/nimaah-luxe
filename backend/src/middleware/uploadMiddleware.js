import multer from 'multer';
import path from 'path';

// Multer in-memory storage (buffers are passed directly to Cloudinary upload_stream)
const storage = multer.memoryStorage();

// File format validation filter (JPG, JPEG, PNG, WEBP)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/pjpeg',
    'image/x-png',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (
    allowedExtensions.includes(ext) ||
    allowedMimeTypes.includes(mime) ||
    mime.startsWith('image/')
  ) {
    return cb(null, true);
  }

  const err = new Error('Only JPG, JPEG, PNG, and WEBP formats are supported.');
  err.code = 'INVALID_FILE_TYPE';
  return cb(err, false);
};

// 50 MB Maximum Size configuration
export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 Megabytes per file
    files: 10, // Up to 10 files per request
  },
  fileFilter,
});

// Express middleware wrapper to catch errors and normalize req.files / req.file
export const handleUploadMiddleware = (req, res, next) => {
  const uploadHandler = upload.any();

  uploadHandler(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image size must not exceed 50 MB.',
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded at once. Maximum 10 images allowed.',
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

    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }

    if (!req.file && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please select an image.',
      });
    }

    next();
  });
};
