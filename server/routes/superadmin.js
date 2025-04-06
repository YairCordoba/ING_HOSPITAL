import { Router } from 'express';
import { login, createDoctor, listDoctors } from '../controllers/superadminController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.post('/login', login);

//Rutas protegidas por auth (solo SuperAdmin)
router.post('/doctors', auth, createDoctor);
router.get('/doctors', auth, listDoctors);

export default router;
