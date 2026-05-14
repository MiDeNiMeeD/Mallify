import { Router } from 'express';
import { reportContent, listMyReports } from '../controllers/report.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', reportContent);
router.get('/', listMyReports);

export default router;
