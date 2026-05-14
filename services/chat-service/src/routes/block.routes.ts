import { Router } from 'express';
import { listBlocks, blockUser, unblockUser, checkBlock } from '../controllers/block.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', listBlocks);
router.post('/', blockUser);
router.delete('/:userId', unblockUser);
router.get('/check/:userId', checkBlock);

export default router;
