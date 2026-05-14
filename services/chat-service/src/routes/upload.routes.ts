import { Router } from 'express';
import { uploadAttachments } from '../controllers/upload.controller';
import { requireAuth } from '../middleware/auth';
import { uploadChatAttachments } from '../config/upload';

const router = Router();

router.use(requireAuth);

router.post('/', uploadChatAttachments, uploadAttachments);

export default router;
