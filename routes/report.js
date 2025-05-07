const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.post('/create', (req, res) => {
  const { patient_id, report_date, care_suggestions, follow_up_reason, doctor_id } = req.body;

  if (!patient_id || !report_date || !care_suggestions || !follow_up_reason || !doctor_id) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const query = `
    INSERT INTO create_report (patient_id, report_date, care_suggestions, follow_up_reason, doctor_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [patient_id, report_date, care_suggestions, follow_up_reason, doctor_id],
    (err, result) => {
      if (err) {
        console.error('Error al guardar el reporte:', err);
        return res.status(500).json({ message: 'Error al guardar el reporte' });
      }
      res.status(201).json({ message: 'Reporte guardado con éxito', report_id: result.insertId });
    }
  );
});

module.exports = router;
