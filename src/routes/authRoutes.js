import express from 'express';
import { register } from '../controllers/authController.js';
import { login } from '../controllers/authController.js';
import { logout } from '../controllers/authController.js';
import {
  loginSchema,
  registerUserSchema,
} from '../validations/user.validation.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', validate(registerUserSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

export default router;
