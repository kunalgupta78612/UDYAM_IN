import express from 'express';
import { getSchemes, getSchemeById } from '../controllers/schemeController.js';

const router = express.Router();

router.get('/', getSchemes);
router.get('/:schemeId', getSchemeById);

export default router;
