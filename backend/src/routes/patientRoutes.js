import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { dashboard } from '../controllers/patientController.js';

const router = Router();

router.use(protect);

router.get('/dashboard/summary', dashboard);

export default router;
