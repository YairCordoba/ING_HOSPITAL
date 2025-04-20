//server/routes/superadmin.js
import { Router } from 'express';
import { Login, createDoctor, listDoctors, createPatient, createRelative, listPatientsWithoutRelative, getDoctorDetails, getPatientDetails, getRelativeDetails, getAdminDetails } from '../controllers/superadminController.js';
import auth from '../middlewares/auth.js';
import { backupDatabase } from '../controllers/backupController.js';

const router = Router();

//Gets
router.get('/doctors', auth, listDoctors);
router.get('/patients/without-relative', auth, listPatientsWithoutRelative);
router.get('/backup', auth, backupDatabase);
router.get('/doctors/:id', auth, getDoctorDetails);
router.get('/patients/:id', auth, getPatientDetails);
router.get('/relatives/:id', auth, getRelativeDetails);
router.get('/admins/:id', auth, getAdminDetails); 


//Post
router.post('/patients', auth, createPatient);
router.post('/relatives', auth, createRelative);
router.post('/login', Login);
router.post('/doctors', auth, createDoctor);

//Puts



//Deletes

export default router;
