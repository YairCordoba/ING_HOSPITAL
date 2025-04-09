import { Router } from 'express';
import { Login, createDoctor, listDoctors } from '../controllers/superadminController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.post('/login', Login);
router.post('/doctors', auth, createDoctor);
router.get('/doctors', auth, listDoctors);

export default router;
