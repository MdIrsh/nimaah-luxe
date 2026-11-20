import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { handleUploadMiddleware } from '../middleware/uploadMiddleware.js';
import { protectOptional } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protectOptional, handleUploadMiddleware, uploadImage);

export default router;
