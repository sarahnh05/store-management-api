import express from 'express';
import { prisma } from '../config/db.js';
import { createProductSchema } from '../validations/product.validation.js';
import { updateProductSchema } from '../validations/product.validation.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/', validate(createProductSchema), async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.validatedData,
      // ...userId,
    });

    res.status(201).json({
      message: 'Product created',
      data: product,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Product name already exists',
      });
    }

    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

router.get('/', async (req, res) => {
  try {
    let { page = 1, limit = 10, category, search } = req.query;

    const allowedCategory = ['FOOD', 'DRINK', 'SNACK', 'DESSERT', 'OTHER'];
    if (category && !allowedCategory.includes(category.toUpperCase())) {
      return res.status(400).json({
        message: 'Invalid category',
      });
    }

    const products = await prisma.product.findMany({
      where: {
        isDeleted: false,
        ...(category && { category: category.toUpperCase() }),
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.product.count({
      where: {
        isDeleted: false,
      },
    });

    res.json({
      message: 'Success',
      total,
      totalPages: Math.ceil(total / limit),
      page: Number(page),
      limit: Number(limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id, isDeleted: false },
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    res.json({
      message: 'Success',
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse(req.body);

    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        message: 'At least one field must be provided',
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      message: 'Product updated',
      data: updatedProduct,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Product name already exists',
      });
    }

    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await prisma.product.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    res.json({
      message: 'Product deleted',
      data: deletedProduct,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    console.error(error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

export default router;
