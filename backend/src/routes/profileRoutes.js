import express from 'express';
import { getProfile, confirmProfile } from '../controllers/profileController.js';

const router = express.Router();

router.get('/:conversationId', getProfile);
router.post('/confirm', confirmProfile);

export default router;
