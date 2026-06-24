import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createPlan, getPlan, updatePlan } from '../controllers/planController.js';

const router = Router();

router.use(protect);

router.route('/:patientId')
  .post(authorize('doctor'), createPlan)
  .get(getPlan)
  .put(authorize('doctor'), updatePlan);

export default router;
