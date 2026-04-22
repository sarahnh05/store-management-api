import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  addOrderItem,
  checkoutOrder,
  createOrder,
  deleteOrderItem,
  getOrderById,
  updateOrderItem,
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', authMiddleware, createOrder);

router.post('/:orderId/items', addOrderItem);
router.post('/:orderId/checkout', authMiddleware, checkoutOrder);

router.patch('/:orderId/items/:itemId', authMiddleware, updateOrderItem);
router.delete('/:orderId/items/:itemId', authMiddleware, deleteOrderItem);

router.get('/:id', authMiddleware, getOrderById);
// router.get('/', getAllOrder);

export default router;
