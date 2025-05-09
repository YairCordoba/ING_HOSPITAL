const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const vitalRoutes = require('./routes/vitalSigns.routes');
const appointmentRoutes = require('./routes/appointments.routes');
const connection = require('./db/connection');
const reportRoutes = require('./routes/report');
const nodemailer = require('nodemailer');


const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5501',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS del frontend)
app.use(express.static(path.join(__dirname)));
app.get('/auth/login', (req, res) => {
  res.send('Usa POST con JSON para hacer login en esta ruta.');
});
app.use('/auth', authRoutes); 
app.use('/vital-signs', vitalRoutes);
app.use(appointmentRoutes);
app.use('/reports', reportRoutes);
app.post("/buscar-usuario", (req, res) => {
  const { cedula } = req.body;
  const sql = "SELECT name, email FROM users WHERE id_card = ?";

  connection.query(sql, [cedula], (err, results) => {
    if (err) return res.json({ success: false, message: "Error en base de datos" });

    if (results.length === 0) {
      return res.json({ success: false, message: "Documento no encontrado. Verifique e intente nuevamente" });
    }

    const { name, email } = results[0];
    res.json({ success: true, name, email });
  });
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const recoveryCodes = {}; 

app.post("/enviar-codigo", (req, res) => {
  const { cedula } = req.body;

  const sql = "SELECT email FROM users WHERE id_card = ?";
  connection.query(sql, [cedula], (err, results) => {
    if (err) return res.json({ success: false, message: "Error en la base de datos" });

    if (results.length === 0) {
      return res.json({ success: false, message: "Usuario no encontrado" });
    }

    const email = results[0].email;
    const code = Math.floor(100000 + Math.random() * 900000); // Código de 6 dígitos
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos de validez

    recoveryCodes[cedula] = { code, expiresAt };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código de recuperación de contraseña',
      text: `Tu código de recuperación es: ${code}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.json({ success: false, message: "No se pudo enviar el correo" });
      }
      res.json({ success: true, message: "Código enviado al correo" });
    });
  });
});


app.post("/verificar-codigo", (req, res) => {
  const { cedula, codigo } = req.body;

  const record = recoveryCodes[cedula];
  if (!record) {
    return res.json({ success: false, message: "No se ha solicitado recuperación" });
  }

  if (Date.now() > record.expiresAt) {
    delete recoveryCodes[cedula];
    return res.json({ success: false, message: "El código expiró" });
  }

  if (parseInt(codigo) !== record.code) {
    return res.json({ success: false, message: "Código incorrecto" });
  }

  res.json({ success: true, message: "Código verificado" });
});

app.post("/actualizar-contrasena", (req, res) => {
  const { cedula, nuevaClave } = req.body;
  const sql = "UPDATE users SET password = ? WHERE id_card = ?";

  connection.query(sql, [nuevaClave, cedula], (err, result) => {
    if (err) return res.json({ success: false, message: "Error al actualizar" });

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: "Usuario no encontrado" });
    }

    delete recoveryCodes[cedula];

    res.json({ success: true });
  });
});

// Ruta API para obtener pacientes por cédula
// Ruta API para obtener pacientes por cédula
// Ruta API para obtener pacientes por cédula
app.get('/api/pacientes', (req, res) => {
  const cedula = req.query.cedula;
  if (!cedula) return res.json({ error: 'Cédula no proporcionada' });

  connection.query('SELECT id_doctor, name FROM doctors WHERE id_card = ?', [cedula], (err, results) => {
    if (err) return res.json({ error: 'Error al buscar doctor' });
    if (results.length === 0) return res.json({ error: 'Doctor no encontrado' });

    const idDoctor = results[0].id_doctor;

    // Modificación de la consulta para seleccionar todos los datos del paciente
    connection.query(
      `SELECT name, email, phone, id_patient, id_card, birth_date, address, occupation, marital_status 
       FROM patients 
       WHERE id_doctor = ?`, 
      [idDoctor], 
      (err, pacientes) => {
        if (err) return res.json({ error: 'Error al buscar pacientes' });

        res.json({ doctor: results[0].name, pacientes });
      }
    );
  });
});


// Cambiar la ruta de /api/vital-signs a /api/signos-vitales
app.get('/api/signos-vitales', (req, res) => {
  const idPatient = req.query.id_patient;
  
  if (!idPatient) {
    return res.status(400).json({ error: 'Cédula o ID de paciente no proporcionado' });
  }

  // Consultar signos vitales del paciente
  const sql = `
    SELECT measurement_date, measurement_time, heart_rate, temperature,
           blood_pressure, respiratory_rate, weight, observations
    FROM vital_signs
    WHERE id_patient = ?
    ORDER BY measurement_date DESC, measurement_time DESC
  `;
  
  connection.query(sql, [idPatient], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los signos vitales' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron signos vitales para este paciente' });
    }

    res.json({ success: true, vitalSigns: results });
  });
});



app.get('/api/citas', (req, res) => {
  const cedula = req.query.cedula;

  if (!cedula) {
    return res.status(400).json({ error: 'Cédula no proporcionada' });
  }

  // Obtener el ID del doctor con esa cédula
  const doctorSql = 'SELECT id_doctor, name FROM doctors WHERE id_card = ?';
  connection.query(doctorSql, [cedula], (err, doctorResults) => {
    if (err) return res.status(500).json({ error: 'Error al buscar doctor' });
    if (doctorResults.length === 0) return res.status(404).json({ error: 'Doctor no encontrado' });

    const idDoctor = doctorResults[0].id_doctor;

    // Buscar citas del doctor
    const citasSql = `
      SELECT a.id_appointment, a.appointment_date, a.appointment_time, 
             p.name AS patient_name, p.id_card AS patient_id_card, a.status
      FROM appointments a
      JOIN patients p ON a.id_patient = p.id_patient
      WHERE a.id_doctor = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;

    connection.query(citasSql, [idDoctor], (err, citas) => {
      if (err) return res.status(500).json({ error: 'Error al obtener citas' });

      res.json({
        success: true,
        doctor: doctorResults[0].name,
        citas
      });
    });
  });
});

app.post('/api/confirmar-cita', (req, res) => {
  const { id_appointment } = req.body;

  const sql = 'UPDATE appointments SET status = 1 WHERE id_appointment = ?';

  connection.query(sql, [id_appointment], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error en la base de datos' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }

    res.json({ success: true });
  });
});



app.delete('/appointments/:id', (req, res) => {
  const id = req.params.id;

  const sql = 'DELETE FROM appointments WHERE id_appointment = ?';

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar cita:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.status(200).json({ message: 'Cita eliminada correctamente' });
  });
});

app.get('/api/relatives/:id_patient', (req, res) => {
  const idPatient = req.params.id_patient;
  console.log('ID del paciente recibido:', idPatient); // <-- Agrega esto

  const sql = 'SELECT * FROM relatives WHERE id_patient = ?';

  connection.query(sql, [idPatient], (err, results) => {
    if (err) {
      console.error('Error al obtener familiares:', err);
      return res.status(500).json({ error: 'Error al obtener familiares' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron familiares para este paciente' });
    }

    res.json(results);
  });
});



app.get('/api/relatives/:id_patient', (req, res) => {
  const idPatient = parseInt(req.params.id_patient);

  if (isNaN(idPatient)) {
    return res.status(400).json({ error: 'ID de paciente inválido' });
  }

  console.log('ID del paciente recibido:', idPatient);

  const sql = 'SELECT * FROM relatives WHERE id_patient = ?';
  console.log('Consulta SQL:', sql, 'con valores:', [idPatient]);

  connection.query(sql, [idPatient], (err, results) => {
    if (err) {
      console.error('Error al obtener familiares:', err);
      return res.status(500).json({ error: 'Error interno al obtener familiares' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron familiares para este paciente' });
    }

    res.json(results);
  });
});


app.use(express.json()); // Asegúrate de tener esto para parsear JSON


app.post('/api/patient/update', (req, res) => {
  const { id_patient, phone, address, marital_status, occupation } = req.body;

  if (!id_patient) {
    return res.status(400).json({ success: false, message: 'ID requerido' });
  }

  const sql = `
    UPDATE patients SET 
      phone = ?, 
      address = ?, 
      marital_status = ?, 
      occupation = ? 
    WHERE id_patient = ?
  `;

  connection.query(sql, [phone, address, marital_status, occupation, id_patient], (err, result) => {
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).json({ success: false, message: 'Error del servidor' });
    }
    res.json({ success: true });
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
