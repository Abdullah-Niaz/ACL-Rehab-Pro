import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient
} from '../controllers/doctorController.js';

const router = Router();

// Protect all routes to doctors only
router.use(protect);
router.use(authorize('doctor'));

router.route('/patients')
  .post(createPatient)
  .get(getPatients);

router.route('/patients/:id')
  .get(getPatient)
  .put(updatePatient)
  .delete(deletePatient);

export default router;
