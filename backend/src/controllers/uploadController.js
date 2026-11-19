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

// @desc    Upload an image (supports up to 50MB, formats: JPG, JPEG, PNG, WEBP)
// @route   POST /api/upload
// @access  Public / Private
export const uploadImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return errorResponse(res, 'No image file uploaded', 400);
    }

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    // If Cloudinary is configured, upload to Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'stylehub-luxe',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          max_bytes: 50 * 1024 * 1024,
        });

        // Clean up temporary local disk file
        try {
          fs.unlinkSync(file.path);
        } catch {}

        return successResponse(res, 'Image uploaded successfully to Cloudinary', {
          url: result.secure_url,
          filename: file.originalname,
          size: `${fileSizeMB} MB`,
          format: result.format,
          publicId: result.public_id,
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload warning (falling back to server upload):', cloudErr.message);
      }
    }

    // Server-hosted fallback URL (smart protocol & reverse-proxy detection)
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
    const serverUrl = `${baseUrl.replace(/\/$/, '')}/uploads/${file.filename}`;

    return successResponse(res, 'Image uploaded successfully to server', {
      url: serverUrl,
      filename: file.originalname,
      size: `${fileSizeMB} MB`,
      format: file.mimetype.split('/')[1] || 'image',
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    return errorResponse(res, error.message || 'Image upload failed', 500);
  }
};
