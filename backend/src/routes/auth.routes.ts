import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema, changePasswordSchema } from '../utils/validators';
import rateLimit from 'express-rate-limit';

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

router.post('/refresh', refreshLimiter, AuthController.refreshToken);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getCurrentUser);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  AuthController.changePassword
);

export default router;