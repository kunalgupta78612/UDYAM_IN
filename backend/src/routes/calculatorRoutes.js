import express from 'express';
import { calculateEMIEndpoint, calculateSubsidyEndpoint, getCalculatorSchemes } from '../controllers/calculatorController.js';

const router = express.Router();

router.post('/emi', calculateEMIEndpoint);
router.post('/subsidy', calculateSubsidyEndpoint);
router.get('/schemes', getCalculatorSchemes);

export default router;
