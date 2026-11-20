import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Configure Cloudinary if credentials exist
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// @desc    Upload image(s) (supports up to 50MB per file, formats: JPG, JPEG, PNG, WEBP)
// @route   POST /api/upload
// @access  Public / Private
export const uploadImage = async (req, res) => {
  try {
    const files =
      req.files && req.files.length > 0 ? req.files : req.file ? [req.file] : [];

    if (!files || files.length === 0) {
      return errorResponse(res, 'No image file uploaded', 400);
    }

    const uploadedResults = [];

    // Protocol & baseUrl detection
    const isHttps =
      req.protocol === 'https' ||
      req.headers['x-forwarded-proto'] === 'https' ||
      process.env.NODE_ENV === 'production';
    const protocol = isHttps ? 'https' : (req.protocol || 'http');
    const host = req.get('host') || 'localhost:5000';
    const baseUrl =
      process.env.RENDER_EXTERNAL_URL ||
      process.env.BACKEND_URL ||
      `${protocol}://${host}`;

    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    for (const file of files) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      let uploadedUrl = null;

      if (hasCloudinary) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'stylehub-luxe',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            max_bytes: 50 * 1024 * 1024,
          });

          try {
            fs.unlinkSync(file.path);
          } catch {}

          uploadedUrl = result.secure_url;
        } catch (cloudErr) {
          console.warn('Cloudinary upload warning (fallback to server disk):', cloudErr.message);
        }
      }

      if (!uploadedUrl) {
        uploadedUrl = `${baseUrl.replace(/\/$/, '')}/uploads/${file.filename}`;
      }

      uploadedResults.push({
        url: uploadedUrl,
        filename: file.originalname,
        size: `${fileSizeMB} MB`,
        format: file.mimetype?.split('/')[1] || 'image',
      });
    }

    if (uploadedResults.length === 1) {
      return successResponse(res, 'Image uploaded successfully', uploadedResults[0]);
    }

    return successResponse(res, 'Images uploaded successfully', {
      url: uploadedResults[0].url,
      urls: uploadedResults.map((r) => r.url),
      images: uploadedResults,
      count: uploadedResults.length,
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    return errorResponse(res, error.message || 'Image upload failed', 500);
  }
};
