import { prisma } from '../config/db.js';
import {
  addItemToOrderService,
  checkoutOrderService,
  deleteOrderItemService,
  getOrderByIdService,
  updateOrderItemService,
} from '../services/order.service.js';

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        total: 0,
      },
    });

    return res.status(201).json({
      message: 'Order created',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create order',
    });
  }
};

const addOrderItem = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId, quantity } = req.body;

    const result = await addItemToOrderService({
      orderId,
      productId,
      quantity,
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateOrderItem = async (req, res) => {
  try {
    const result = await updateOrderItemService({
      orderId: req.params.orderId,
      itemId: req.params.itemId,
      quantity: req.body.quantity,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteOrderItem = async (req, res) => {
  try {
    const result = await deleteOrderItemService({
      orderId: req.params.orderId,
      itemId: req.params.itemId,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const checkoutOrder = async (req, res) => {
  try {
    console.log('payment', req.body.paymentMethod);
    const result = await checkoutOrderService({
      orderId: req.params.orderId,
      paymentMethod: req.body.paymentMethod,
      amountPaid: req.body.amountPaid,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    console.log('orderiddd', req.params.id);
    const result = await getOrderByIdService({
      orderId: req.params.id,
      userId: req.user.id, // nanti dari middleware
    });

    res.json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export {
  createOrder,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
  checkoutOrder,
  getOrderById,
};
