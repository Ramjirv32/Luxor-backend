import express from 'express';
import { clerkSync, verifyToken } from '../controllers/authController.js';

const router = express.Router();

// Sync Clerk user with our database
router.post('/clerk-sync', clerkSync);

// Verify JWT token
router.get('/verify', verifyToken);

export default router;