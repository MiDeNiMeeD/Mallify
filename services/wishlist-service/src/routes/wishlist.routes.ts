import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';

const router = Router();

router.get('/:userId', wishlistController.getWishlist);
router.post('/:userId/items', wishlistController.addToWishlist);
router.delete('/:userId/items/:productId', wishlistController.removeFromWishlist);

export default router;
