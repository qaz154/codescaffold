import { Router } from 'express';
import {
  getUsers,
  getUserById,
  register,
  login,
  getProfile,
  updateProfile,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// Admin routes
router.get('/', authenticateToken, requireRole('admin'), getUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, requireRole('admin'), updateUser);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteUser);

export default router;
