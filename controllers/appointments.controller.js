const db = require('../db/connection');

// Obtener lista de doctores
exports.getDoctors = (req, res) => {
  db.query('SELECT id_doctor, name, specialization FROM doctors', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener doctores' });
    res.json(results);
  });
};
// Obtener horarios disponibles por doctor y fecha
exports.getAvailableTimes = (req, res) => {
  const { id_doctor, date } = req.params;

  // Generar todos los intervalos posibles
  const generateTimeSlots = () => {
    const slots = [];
    const periods = [
      { start: 7, end: 12 },   // Mañana
      { start: 13, end: 18 }   // Tarde
    ];

    for (const period of periods) {
      let current = new Date(`2000-01-01T${period.start.toString().padStart(2, '0')}:00:00`);
      const end = new Date(`2000-01-01T${period.end.toString().padStart(2, '0')}:00:00`);

      while (current < end) {
        const slot = current.toTimeString().substring(0, 5); // HH:MM
        slots.push(slot);
        current = new Date(current.getTime() + 50 * 60000); // 45 + 5 min
      }
    }

    return slots;
  };

  const allSlots = generateTimeSlots();

  // Obtener las ya reservadas
  db.query(
    'SELECT appointment_time FROM appointments WHERE id_doctor = ? AND appointment_date = ?',
    [id_doctor, date],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error al verificar horarios' });

      const reserved = results.map(r => r.appointment_time.slice(0, 5));
      const available = allSlots.filter(slot => !reserved.includes(slot));
      res.json(available);
    }
  );
};

// Crear una nueva cita (sin restricciones)
exports.createAppointment = (req, res) => {
  const { id_patient, id_doctor, appointment_date, appointment_time } = req.body;

  // Verificar si el paciente ya tiene una cita en esa fecha y hora
  db.query(`
    SELECT * FROM appointments
    WHERE id_patient = ? AND appointment_date = ? AND appointment_time = ?
  `, [id_patient, appointment_date, appointment_time], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al verificar disponibilidad del paciente' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'Ya tienes una cita agendada en ese horario' });
    }

    // Si no hay conflicto, insertar la nueva cita
    db.query(`
      INSERT INTO appointments (id_patient, id_doctor, appointment_date, appointment_time)
      VALUES (?, ?, ?, ?)
    `, [id_patient, id_doctor, appointment_date, appointment_time], (err2) => {
      if (err2) {
        return res.status(500).json({ message: 'Error al agendar la cita' });
      }
      res.json({ message: 'Cita agendada correctamente' });
    });
  });
};



// Ver citas del paciente
exports.getAppointmentsByPatient = (req, res) => {
  const { id_patient } = req.params;
  db.query(`
    SELECT a.*, d.name AS doctor_name, d.specialization
    FROM appointments a
    JOIN doctors d ON a.id_doctor = d.id_doctor
    WHERE a.id_patient = ?
    ORDER BY appointment_date DESC
  `, [id_patient], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener citas' });
    res.json(results);
  });
};
