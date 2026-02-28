import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';

const router = Router();

router.get('/', reviewController.getReviews);
router.post('/', reviewController.createReview);
router.delete('/:id', reviewController.deleteReview);

export default router;
