import { prisma } from '../config/db.js';

export const checkProductAccess = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const isOwner = product.userId === req.user.id;
    const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Forbidden',
      });
    }

    req.product = product;

    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};
