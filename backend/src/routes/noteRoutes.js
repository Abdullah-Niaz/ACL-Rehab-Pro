import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { addNote, getNotes } from '../controllers/noteController.js';
const router=Router(); router.use(protect); router.get('/:patientId',getNotes); router.post('/',authorize('doctor'),addNote);
export default router;
