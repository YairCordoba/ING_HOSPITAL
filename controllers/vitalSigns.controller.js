const connect = require('../db/connection');

// Crear signos vitales
exports.createVitalSigns = (req, res) => {
  const {
    id_patient,
    measurement_date,
    measurement_time,
    heart_rate,
    temperature,
    blood_pressure,
    respiratory_rate,
    weight,
    observations
  } = req.body;

  const sql = `
    INSERT INTO vital_signs (
      id_patient, measurement_date, measurement_time, heart_rate, temperature, 
      blood_pressure, respiratory_rate, weight, observations
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    id_patient,
    measurement_date,
    measurement_time,
    heart_rate,
    temperature,
    blood_pressure,
    respiratory_rate,
    weight,
    observations || null
  ];

  connect.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al insertar signos vitales:', err);
      return res.status(500).json({ message: 'Error al guardar los signos vitales' });
    }
    res.status(200).json({ message: 'Signos vitales guardados exitosamente' });
  });
};

// Obtener signos vitales por paciente
exports.getVitalSignsByPatient = (req, res) => {
  const patientId = req.params.id;
  const query = 'SELECT * FROM vital_signs WHERE id_patient = ?';

  connect.query(query, [patientId], (err, results) => {
    if (err) {
      console.error('Error al obtener signos vitales:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron registros para este paciente' });
    }

    return res.json(results);
  });
};
