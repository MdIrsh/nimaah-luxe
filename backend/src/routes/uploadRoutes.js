import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { handleUploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', handleUploadMiddleware, uploadImage);

export default router;
