import express from 'express';
import { startConversation, sendMessage } from '../controllers/chatController.js';

const router = express.Router();

router.post('/start', startConversation);
router.post('/message', sendMessage);

export default router;
