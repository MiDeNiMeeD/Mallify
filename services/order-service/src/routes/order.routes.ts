import { Router } from 'express';
import * as orderController from '../controllers/order.controller';

const router = Router();

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.post('/checkout', orderController.createCheckoutOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.patch('/store/:id/action', orderController.updateStoreOrderStatus);

export default router;
