import { Router } from 'express';
import { getAllUsers, checkCedulaExists, checkEmailExists } from '../controllers/UsersController.js';
import auth from '../middlewares/auth.js';

const router = Router();

// Protegido por auth: solo admins pueden ver usuarios
router.get('/', auth, getAllUsers);
router.get('/check-email', auth, checkEmailExists);
router.get('/check-cedula', auth, checkCedulaExists);

export default router;
