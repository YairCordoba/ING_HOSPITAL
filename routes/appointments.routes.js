const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointments.controller');

router.get('/doctors', appointmentController.getDoctors);
router.get('/available-times/:id_doctor/:date', appointmentController.getAvailableTimes);
router.post('/appointments', appointmentController.createAppointment);
router.get('/appointments/patient/:id_patient', appointmentController.getAppointmentsByPatient);

module.exports = router;
