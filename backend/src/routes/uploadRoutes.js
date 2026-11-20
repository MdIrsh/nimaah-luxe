import express from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { handleUploadMiddleware } from '../middleware/uploadMiddleware.js';
import { protectOptional } from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload Routes (supports single, multiple, and batch uploads)
router.post('/', protectOptional, handleUploadMiddleware, uploadImage);
router.post('/single', protectOptional, handleUploadMiddleware, uploadImage);
router.post('/multiple', protectOptional, handleUploadMiddleware, uploadImage);

// Delete Image Route
router.delete('/:publicId(*)', protectOptional, deleteImage);
router.delete('/', protectOptional, deleteImage);

export default router;
