import express from 'express';
import { getNearbyPartners, getAllPartners, getPartnerById } from '../controllers/partnerController.js';

const router = express.Router();

router.get('/nearby', getNearbyPartners);
router.get('/', getAllPartners);
router.get('/:partnerId', getPartnerById);

export default router;
