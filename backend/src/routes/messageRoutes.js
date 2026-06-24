import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { sendMessage, getConversation, markAsRead } from '../controllers/messageController.js';

const router = Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/conversation/:patientId', getConversation);
router.patch('/read/:patientId', markAsRead);

export default router;
