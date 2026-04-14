import express from 'express';
import { prisma } from '../config/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    let { name, price, stock, description, category, userId } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: 'Name is required',
      });
    }

    price = Number(price);
    if (!price || price <= 0) {
      return res.status(400).json({
        message: 'Price must be greater than 0',
      });
    }

    stock = Number(stock);
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({
        message: 'Stock must be a number >= 0',
      });
    }

    const allowedCategory = ['FOOD', 'DRINK', 'SNACK', 'OTHER'];
    if (!category) {
      return res.status(400).json({
        message: 'Category is required',
      });
    }

    category = category.toUpperCase();

    if (!allowedCategory.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        category,
        price,
        stock,
        description,
        userId,
      },
    });

    res.status(201).json({
      message: 'Product created',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const products = await prisma.product.findMany({
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    res.json({
      message: 'Success',
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
      where: { id },
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
    const { name, price, description, stock } = req.body;

    const dataToUpdate = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (price !== undefined) dataToUpdate.price = Number(price);
    if (description !== undefined) dataToUpdate.description = description;

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({
        message: 'At least one field must be updated',
      });
    }

    if (dataToUpdate.price !== undefined && isNaN(dataToUpdate.price)) {
      return res.status(400).json({
        message: 'Price must be a number',
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json({
      message: 'Product updated',
      data: product,
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

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await prisma.product.delete({
      where: { id },
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
