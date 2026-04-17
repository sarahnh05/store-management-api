import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .transform((val) => val.trim()),

  email: z.string().min(1, 'Email is required').email('Invalid email format'),

  password: z.string().min(1, 'Password is required'),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});
