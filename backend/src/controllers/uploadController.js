import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cloudinary, { uploadStreamToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { Media } from '../models/Media.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists for resilient fallback
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// @desc    Upload image(s) to Cloudinary via Multer memory storage and upload_stream
// @route   POST /api/upload
// @access  Public / Private
export const uploadImage = async (req, res) => {
  try {
    const files =
      req.files && req.files.length > 0 ? req.files : req.file ? [req.file] : [];

    if (!files || files.length === 0) {
      return errorResponse(res, 'No image file uploaded. Please select an image.', 400);
    }

    const uploadedResults = [];

    // Protocol & Base URL detection for fallback
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
      const ext = path.extname(file.originalname || '.jpg').toLowerCase();
      const cleanBaseName = path
        .basename(file.originalname || 'image', ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_');

      let uploadedUrl = null;
      let publicId = null;
      let uploadSource = 'server-disk';

      // 1. Try uploading to Cloudinary via upload_stream
      if (hasCloudinary && file.buffer) {
        try {
          const uploadFolder = req.body.folder || 'nimaah-luxe/products';
          const result = await uploadStreamToCloudinary(file.buffer, {
            folder: uploadFolder,
            resource_type: 'image',
            public_id: `${cleanBaseName}-${Date.now()}`,
          });

          if (result && result.secure_url) {
            uploadedUrl = result.secure_url;
            publicId = result.public_id;
            uploadSource = 'cloudinary';
          }
        } catch (cloudErr) {
          console.warn('Cloudinary upload warning (fallback to server disk):', cloudErr.message);
        }
      }

      // 2. Resilient permanent fallback to MongoDB Atlas & server disk if Cloudinary was restricted
      if (!uploadedUrl) {
        const fallbackFilename = `${cleanBaseName}-${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, fallbackFilename);

        if (file.buffer) {
          // A. Save to disk cache
          try {
            fs.writeFileSync(filePath, file.buffer);
          } catch (fsErr) {
            console.warn('Local disk cache write failed:', fsErr.message);
          }

          // B. Save permanently to MongoDB Atlas so Render redeploys NEVER lose the image
          try {
            const base64Url = `data:${file.mimetype || 'image/jpeg'};base64,${file.buffer.toString('base64')}`;
            await Media.findOneAndUpdate(
              { filename: fallbackFilename },
              {
                filename: fallbackFilename,
                contentType: file.mimetype || 'image/jpeg',
                data: file.buffer,
                base64Url,
                size: file.size,
              },
              { upsert: true, new: true }
            );
          } catch (dbErr) {
            console.error('Failed to save media to MongoDB:', dbErr.message);
          }
        }
        uploadedUrl = `${baseUrl.replace(/\/$/, '')}/uploads/${fallbackFilename}`;
        publicId = fallbackFilename;
        uploadSource = 'mongodb-atlas';
      }

      uploadedResults.push({
        url: uploadedUrl,
        secure_url: uploadedUrl,
        public_id: publicId,
        filename: file.originalname,
        size: `${fileSizeMB} MB`,
        format: file.mimetype?.split('/')[1] || ext.replace('.', '') || 'image',
        source: uploadSource,
      });
    }

    if (uploadedResults.length === 1) {
      return successResponse(res, 'Image uploaded successfully', {
        ...uploadedResults[0],
        urls: [uploadedResults[0].url],
        images: uploadedResults,
        count: 1,
      });
    }

    return successResponse(res, 'Images uploaded successfully', {
      url: uploadedResults[0].url,
      secure_url: uploadedResults[0].secure_url,
      public_id: uploadedResults[0].public_id,
      urls: uploadedResults.map((r) => r.url),
      images: uploadedResults,
      count: uploadedResults.length,
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    return errorResponse(res, error.message || 'Image upload failed', 500);
  }
};

// @desc    Delete image from Cloudinary or server disk
// @route   DELETE /api/upload/:publicId
// @access  Private / Admin
export const deleteImage = async (req, res) => {
  try {
    const publicId = req.params.publicId || req.body.public_id;
    if (!publicId) {
      return errorResponse(res, 'Image public ID or filename is required', 400);
    }

    if (publicId.includes('nimaah-luxe')) {
      const result = await deleteFromCloudinary(publicId);
      return successResponse(res, 'Image deleted successfully from Cloudinary', result);
    }

    // Otherwise check local disk
    const localPath = path.join(uploadDir, path.basename(publicId));
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return successResponse(res, 'Local image deleted successfully');
    }

    return successResponse(res, 'Image removed');
  } catch (error) {
    console.error('Delete image error:', error);
    return errorResponse(res, error.message || 'Failed to delete image', 500);
  }
};
