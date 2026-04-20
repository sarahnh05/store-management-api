import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .transform((val) => val.toLowerCase().trim())
    .refine((val) => val !== '', { message: 'Email is required' }),

  password: z.string().min(1, 'Password is required'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .transform((val) => val.toLowerCase().trim())
    .refine((val) => val !== '', { message: 'Email is required' }),

  password: z.string().min(1, 'Password is required'),
});
