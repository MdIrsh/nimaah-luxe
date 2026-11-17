import express from 'express';
import { getAllUsers, addAddress } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllUsers);
router.post('/address', protect, addAddress);

export default router;
