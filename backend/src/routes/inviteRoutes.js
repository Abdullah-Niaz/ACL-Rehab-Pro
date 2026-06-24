import { Router } from 'express';
import { verifyToken, acceptInvite } from '../controllers/inviteController.js';

const router = Router();

router.get('/:token', verifyToken);
router.post('/accept', acceptInvite);

export default router;
