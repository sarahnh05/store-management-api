import { prisma } from '../config/db.js';

export const calculateOrderTotal = async (orderId) => {
  console.log('orderid', orderId);
  const items = await prisma.orderItem.findMany({
    where: { orderId },
  });

  console.log('items', items);

  const total = items.reduce((acc, item) => acc + item.subTotal, 0);
  console.log(total);
  return total;
};

export const addItemToOrderService = async ({
  orderId,
  productId,
  quantity,
}) => {
  // 1. cek order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status === 'PAID') {
    throw new Error('Order already paid');
  }

  // 2. cek product
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const priceAtTime = product.price;

  // 3. cek existing item
  const existingItem = await prisma.orderItem.findFirst({
    where: { orderId, productId },
  });

  let item;

  console.log('item ini', existingItem);
  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    const newSubtotal = newQty * priceAtTime;

    item = await prisma.orderItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: newQty,
        priceAtTime,
        subTotal: newSubtotal,
      },
    });
  } else {
    const subTotal = quantity * priceAtTime;

    item = await prisma.orderItem.create({
      data: {
        orderId,
        productId,
        quantity,
        priceAtTime,
        subTotal,
      },
    });
  }

  // 4. update total order
  const total = await calculateOrderTotal(orderId);
  console.log(total);

  await prisma.order.update({
    where: { id: orderId },
    data: { total },
  });

  return {
    message: 'Item added',
    data: item,
    orderTotal: total,
  };
};

export const updateOrderItemService = async ({ orderId, itemId, quantity }) => {
  // 1. cek order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  console.log('update orderid', order);
  if (!order) throw new Error('Order not found');

  if (order.status === 'PAID') {
    throw new Error('Order already paid');
  }
  console.log('itemid', itemId);
  // 2. cek item
  const items = await prisma.orderItem.findUnique({
    where: { id: '990fa243-d9b4-4879-aee4-e5d35e729eec' },
  });

  console.log('items updatee', items);

  const item = await prisma.orderItem.findUnique({
    where: { id: itemId },
  });

  console.log('ini item update', item);

  if (!item || item.orderId !== orderId) {
    throw new Error('Item not found in this order');
  }

  // ❗ EDGE CASE: quantity = 0 → delete
  if (quantity === 0) {
    await prisma.orderItem.delete({
      where: { id: itemId },
    });
  } else {
    const newSubTotal = quantity * item.priceAtTime;

    await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        quantity,
        subTotal: newSubTotal,
      },
    });
  }

  // 3. recalc total
  const total = await calculateOrderTotal(orderId);

  await prisma.order.update({
    where: { id: orderId },
    data: { total },
  });

  return {
    message: quantity === 0 ? 'Item deleted' : 'Item updated',
    orderTotal: total,
  };
};

export const deleteOrderItemService = async ({ orderId, itemId }) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error('Order not found');

  if (order.status === 'PAID') {
    throw new Error('Order already paid');
  }

  const item = await prisma.orderItem.findUnique({
    where: { id: itemId },
  });

  if (!item || item.orderId !== orderId) {
    throw new Error('Item not found in this order');
  }

  await prisma.orderItem.delete({
    where: { id: itemId },
  });

  const total = await calculateOrderTotal(orderId);

  await prisma.order.update({
    where: { id: orderId },
    data: { total },
  });

  return {
    message: 'Item deleted',
    orderTotal: total,
  };
};

export const checkoutOrderService = async ({
  orderId,
  paymentMethod,
  amountPaid,
}) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw new Error('Order not found');

  if (order.status === 'PAID') {
    throw new Error('Order already paid');
  }

  if (!order.items || order.items.length === 0) {
    throw new Error('Order is empty');
  }

  // recalc total
  const total = order.items.reduce((acc, item) => acc + item.subTotal, 0);

  console.log('test:', total);

  if (amountPaid < total) {
    throw new Error('Insufficient payment');
  }

  const changeAmount = amountPaid - total;

  // 💥 pakai transaction biar aman
  const result = await prisma.$transaction(async (tx) => {
    // 1. create payment
    const payment = await tx.payment.create({
      data: {
        orderId,
        amountPaid,
        changeAmount,
        paymentMethod,
        status: 'SUCCESS',
        paidAt: new Date(),
      },
    });

    // 2. update order
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        total,
        status: 'PAID',
      },
    });

    return { payment, order: updatedOrder };
  });

  return {
    message: 'Checkout success',
    data: result,
  };
};

export const getOrderByIdService = async ({ orderId, userId }) => {
  console.log('orderId', orderId);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
    },
  });

  if (!order) throw new Error('Order not found');

  // 🔒 ownership check (optional tapi bagus)
  if (order.userId !== userId) {
    throw new Error('Unauthorized');
  }

  return order;
};
