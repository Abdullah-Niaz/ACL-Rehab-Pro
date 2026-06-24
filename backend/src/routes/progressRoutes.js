import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createLog, getLogs, myProgress, rtsScore } from '../controllers/progressController.js';

const router = Router();

router.use(protect);

router.post('/', createLog);
router.get('/me', myProgress);
router.get('/patient/:patientId', getLogs);
router.post('/rts-score', rtsScore);

export default router;
