import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';

const router = Router();

router.get('/:userId', cartController.getCart);
router.post('/:userId/items', cartController.addToCart);
router.patch('/:userId/items/:productId', cartController.updateCartItem);
router.delete('/:userId/items/:productId', cartController.removeFromCart);

export default router;
