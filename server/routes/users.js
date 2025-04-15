import { Router } from 'express';
import { getAllUsers } from '../controllers/usersController.js';
import auth from '../middlewares/auth.js';

const router = Router();

// Protegido por auth: solo admins pueden ver usuarios
router.get('/', auth, getAllUsers);

export default router;
