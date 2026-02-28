import { Router } from 'express';
import {
  trackEvent,
  getAnalytics,
  getStatistics
} from '../controllers/analytics.controller';

const router = Router();

router.post('/track', trackEvent);
router.get('/events', getAnalytics);
router.get('/statistics', getStatistics);

export default router;
