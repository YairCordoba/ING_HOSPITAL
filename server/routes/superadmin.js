import { Router } from 'express';
import { Login, createDoctor, listDoctors, createPatient, createRelative, listPatientsWithoutRelative, getDoctor, updateDoctor, deleteDoctor, listPatientsDoctor  } from '../controllers/superadminController.js';
import { getPatientbyID } from '../controllers/PatientsController.js';
import auth from '../middlewares/auth.js';
import { backupDatabase } from '../controllers/backupController.js';


const router = Router();

//Gets
router.get('/doctors', auth, listDoctors);
router.get('/patients/without-relative', auth, listPatientsWithoutRelative);
router.get('/see/patient/:id', auth, getPatientbyID);
router.get('/backup', auth, backupDatabase);
router.get('/patients/doctor/:idCard', auth, listPatientsDoctor);
//Post
router.post('/patients', auth, createPatient);
router.post('/relatives', auth, createRelative);
router.post('/login', Login);
router.post('/doctors', auth, createDoctor);
router.post('/doctor', auth, getDoctor);

//Puts
router.put('/doctor', auth, updateDoctor);


//Deletes
router.delete('/doctor/:idCard', auth, deleteDoctor);
export default router;
