import express from 'express';
import superadminRoutes from './superadmin.js';
import userRoutes from './users.js';

const router = express.Router();

// Todas las rutas de SuperAdmin bajo /api/superadmin
router.use('/superadmin', superadminRoutes);

// Todas las rutas de usuarios normales bajo /api/users
router.use('/users', userRoutes);

export default router;
