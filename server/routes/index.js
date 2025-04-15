import express from 'express';
import superadminRoutes from './superadmin.js';
import userRoutes from './users.js';

const router = express.Router();

router.use('/superadmin', superadminRoutes);
router.use('/users', userRoutes);

export default router;
