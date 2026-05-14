import { Router } from 'express';
import { getPersonalizedRecommendations } from '../controllers/ai.controller';

const router = Router();

router.get('/', getPersonalizedRecommendations);
router.get('/:userId', getPersonalizedRecommendations);

export default router;
