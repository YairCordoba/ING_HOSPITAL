import { Router } from 'express';
import { Login, createDoctor, listDoctors, createPatient, createRelative, listPatientsWithoutRelative } from '../controllers/superadminController.js';
import auth from '../middlewares/auth.js';

const router = Router();

//Gets
router.get('/doctors', auth, listDoctors);
router.get('/patients/without-relative', auth, listPatientsWithoutRelative);

//Post
router.post('/patients', auth, createPatient);
router.post('/relatives', auth, createRelative);
router.post('/login', Login);
router.post('/doctors', auth, createDoctor);

//Puts



//Deletes

export default router;
