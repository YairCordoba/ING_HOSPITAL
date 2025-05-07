const express = require('express');
const router = express.Router();
const { createVitalSigns, getVitalSignsByPatient } = require('../controllers/vitalSigns.controller');

// POST para crear signos vitales
router.post('/', createVitalSigns);

// GET para ver signos vitales por id_patient
router.get('/patient/:id', getVitalSignsByPatient);

module.exports = router;
