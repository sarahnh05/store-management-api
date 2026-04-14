// validations/product.validation.js
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .transform((val) => val.trim()),

  price: z.coerce.number().positive('Price must be greater than 0'),

  stock: z.coerce
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock must be >= 0'),

  category: z
    .string()
    .transform((val) => val.toUpperCase())
    .refine(
      (val) => ['FOOD', 'DRINK', 'SNACK', 'DESSERT', 'OTHER'].includes(val),
      {
        message: 'Invalid category',
      },
    ),

  description: z.string().optional(),
  userId: z.string().min(1, 'userId is required'),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1)
    .transform((val) => val.trim())
    .optional(),

  price: z.coerce.number().positive().optional(),

  stock: z.coerce.number().int().min(0).optional(),

  category: z
    .string()
    .transform((val) => val.toUpperCase())
    .refine((val) => ['FOOD', 'DRINK', 'SNACK', 'OTHER'].includes(val), {
      message: 'Invalid category',
    })
    .optional(),

  description: z.string().optional(),
});
