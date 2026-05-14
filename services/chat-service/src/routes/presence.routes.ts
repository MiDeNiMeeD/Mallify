import { Router } from 'express';
import { getPresence, getPresenceBatch } from '../controllers/presence.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/batch', getPresenceBatch);
router.get('/:userId', getPresence);

export default router;
