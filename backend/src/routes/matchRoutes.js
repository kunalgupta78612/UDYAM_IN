import express from 'express';
import { matchSchemes } from '../controllers/matchController.js';

const router = express.Router();

router.post('/', matchSchemes);

export default router;
