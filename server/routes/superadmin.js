//server/routes/superadmin.js
import { Router } from 'express';
import { Login, createDoctor, listDoctors, createPatient, createRelative, listPatientsWithoutRelative, getDoctorDetails, getPatientDetails, getRelativeDetails, getAdminDetails, updateDoctor, deleteDoctor, reassignPatients, deletePatient, updatePatient, updateRelative, updateAdmin, createAdmin, listAdmins } from '../controllers/SuperAdminController.js';
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
router.get('/admins', auth, listAdmins); 


//Post
router.post('/patients', auth, createPatient);
router.post('/relatives', auth, createRelative);
router.post('/login', Login);
router.post('/doctors', auth, createDoctor);
router.post('/admins', auth, createAdmin); 

//Puts
router.put('/doctor', auth, updateDoctor);
router.put('/patients/reassign', auth, reassignPatients);
router.put('/patient', auth, updatePatient);
router.put('/relative', auth, updateRelative);
router.put('/admin', auth, updateAdmin); 

//Deletes
router.delete('/doctor/:id', auth, deleteDoctor);
router.delete('/patients/:id', auth, deletePatient);

export default router;
