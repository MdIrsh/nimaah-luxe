import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { handleUploadMiddleware } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, handleUploadMiddleware, uploadImage);

export default router;
