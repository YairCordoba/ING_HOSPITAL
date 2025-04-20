// server/controllers/superadminController.js

import { db } from '../index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator'; 

export async function Login(req, res) {
  try {
    
    
    const { email, password } = req.body;

    //Validar email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: 'Formato de email inválido' });
    }

    
    const [rows] = await db.query(
      'SELECT id_admin, name, password FROM admins WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ msg: 'Credenciales incorrectas' });
    }

    const admin = rows[0];

    //Verificar contraseña con bcrypt
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ msg: 'Credenciales incorrectas' });
    }

    // Generar JWT de 1 hora
    const token = jwt.sign(
      { id_admin: admin.id_admin, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    //Enviar token al cliente
    res.json({
      token,
      expiresIn: 3599,    //segundos OJO
      admin: { id: admin.id_admin, name: admin.name }
    });
  } catch (err) {
    console.error('Error en login SuperAdmin:', err);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
}
export async function createDoctor(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id_card,
      name,
      email,
      password,       // ya viene hasheada desde el frontend
      specialization,
      phone
    } = req.body;

    // 1) Insertar en doctors
    const [doctorResult] = await conn.query(
      `INSERT INTO doctors
       (id_card, name, email, password, specialization, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_card, name, email, password, specialization, phone]
    );

    // 2) Insertar en users
    await conn.query(
      `INSERT INTO users
       (id_card, name, email, password, role)
       VALUES (?, ?, ?, ?, 'Doctor')`,
      [id_card, name, email, password]
    );

    await conn.commit();
    res.status(201).json({ msg: 'Doctor creado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en createDoctor:', err);
    // Errores de duplicado:
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ msg: 'Cédula o email ya registrados' });
    }
    res.status(500).json({ msg: 'Error interno al crear doctor' });
  } finally {
    conn.release();
  }
}
export async function listDoctors(req, res) {
  try {
    // desestructuramos rows de la promesa
    const [rows] = await db.query(
      'SELECT id_doctor, id_card, name, email, specialization, phone FROM doctors'
    );
    // enviamos directamente el array de doctores
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener doctores:', err);
    res.status(500).json({ msg: 'Error interno al obtener doctores' });
  }
}
export async function createPatient(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id_card,
      name,
      email,
      password,       //la contra ya debe venir hasheada
      blood_type,
      birth_date,
      occupation,
      marital_status,
      address,
      phone,
      id_doctor
    } = req.body;

    //Insertar en patients
    await conn.query(
      `INSERT INTO patients
       (id_card, name, email, password,
        blood_type, birth_date, occupation,
        marital_status, address, phone, id_doctor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_card, name, email, password,
        blood_type, birth_date, occupation,
        marital_status, address, phone, id_doctor
      ]
    );

    //Insertar en users
    await conn.query(
      `INSERT INTO users
       (id_card, name, email, password, role)
       VALUES (?, ?, ?, ?, 'Patient')`,
      [ id_card, name, email, password ]
    );

    await conn.commit();
    res.status(201).json({ msg: 'Paciente creado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en createPatient:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      // captura duplicados de cédula o email
      return res.status(409).json({ msg: 'Cédula o email ya registrados' });
    }
    res.status(500).json({ msg: 'Error interno al crear paciente' });
  } finally {
    conn.release();
  }
}

export async function createRelative(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const {
      id_card, name, email, password,
      address, phone, id_patient
    } = req.body;

    //Insertar en relatives
    await conn.query(
      `INSERT INTO relatives
       (id_card, name, email, password, address, phone, id_patient)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_card, name, email, password, address, phone, id_patient]
    );

    //Insertar en users
    await conn.query(
      `INSERT INTO users
       (id_card, name, email, password, role)
       VALUES (?, ?, ?, ?, 'Relative')`,
      [id_card, name, email, password]
    );

    await conn.commit();
    res.status(201).json({ msg: 'Familiar creado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en createRelative:', err);
    if (err.code==='ER_DUP_ENTRY') {
      return res.status(409).json({ msg: 'Cédula o email ya registrados' });
    }
    res.status(500).json({ msg: 'Error interno al crear familiar' });
  } finally {
    conn.release();
  }
}

export async function listPatientsWithoutRelative(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id_patient, id_card, name, address
       FROM patients
       WHERE id_patient NOT IN (
         SELECT id_patient FROM relatives
       )`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener pacientes sin familiar:', err);
    res.status(500).json({ msg: 'Error interno al obtener pacientes' });
  }
}

export async function getDoctorDetails(req, res) {
  const id = req.params.id;
  try {
    //Datos del doctor
    const [doctors] = await db.query(
      `SELECT id_doctor AS id, id_card, name, email, specialization, phone
       FROM doctors WHERE id_doctor = ?`,
      [id]
    );
    if (!doctors.length) return res.status(404).json({ msg: 'Doctor no encontrado' });
    const doctor = doctors[0];

    //Pacientes a cargo
    const [patients] = await db.query(
      `SELECT p.id_patient AS id, p.name, p.id_card
       FROM patients p
       WHERE p.id_doctor = ?`,
      [id]
    );

    res.json({ doctor, patients });
  } catch (err) {
    console.error('Error en getDoctorDetails:', err);
    res.status(500).json({ msg: 'Error interno al obtener detalles' });
  }
}

export async function getPatientDetails(req, res) {
  const id = req.params.id;  
  try {
    //Datos principales del paciente
    const [[patient]] = await db.query(
      `SELECT p.id_patient AS id, p.id_card, p.name, p.email,
              p.blood_type, p.birth_date, p.occupation,
              p.marital_status, p.address, p.phone, p.id_doctor
       FROM patients p
       WHERE p.id_patient = ?`,
      [id]
    );
    if (!patient) return res.status(404).json({ msg: 'Paciente no encontrado' });

    //Familiares (puede ser 0 o varios)
    const [relatives] = await db.query(
      `SELECT id_relative AS id, name, id_card
       FROM relatives
       WHERE id_patient = ?`,
      [id]
    );

    //Doctor a cargo
    const [[doctor]] = await db.query(
      `SELECT id_doctor AS id, name, specialization, phone, id_card
       FROM doctors
       WHERE id_doctor = ?`,
      [patient.id_doctor]
    );

    //ultimos signos vitales (puedes ajustar ORDER BY/limit si quieres sólo el último)
    const [vitals] = await db.query(
      `SELECT id_vital AS id,
              measurement_date, measurement_time,
              heart_rate, temperature, blood_pressure,
              respiratory_rate, weight, observations
       FROM vital_signs
       WHERE id_patient = ?
       ORDER BY measurement_date DESC, measurement_time DESC`,
      [id]
    );

    //Citas del paciente
    const [appointments] = await db.query(
      `SELECT id_appointment AS id,
              appointment_date, appointment_time, status
       FROM appointments
       WHERE id_patient = ?`,
      [id]
    );

    res.json({ patient, relatives, doctor, vitals, appointments });
  } catch (err) {
    console.error('Error en getPatientDetails:', err);
    res.status(500).json({ msg: 'Error interno al obtener detalles' });
  }
}

export async function getRelativeDetails(req, res) {
  const id = req.params.id;
  try {
    const [relatives] = await db.query(
      `SELECT id_relative AS id, id_card, name, email, phone, address, id_patient
       FROM relatives WHERE id_relative = ?`,
      [id]
    );

    if (!relatives.length) return res.status(404).json({ msg: 'Familiar no encontrado' });

    const relative = relatives[0];

    //Obtener el paciente asignado
    let patient = null;
    if (relative.id_patient) {
      const [patients] = await db.query(
        `SELECT id_patient AS id, name, id_card FROM patients WHERE id_patient = ?`,
        [relative.id_patient]
      );
      patient = patients[0] || null;
    }

    res.json({ relative, patient });
  } catch (err) {
    console.error('Error en getRelativeDetails:', err);
    res.status(500).json({ msg: 'Error interno al obtener detalles' });
  }
}

export async function getAdminDetails(req, res) {
  const id = req.params.id;
  try {
    const [admins] = await db.query(
      `SELECT id_admin AS id, name, email, id_card FROM admins WHERE id_admin = ?`,
      [id]
    );

    if (!admins.length) return res.status(404).json({ msg: 'Administrador no encontrado' });

    res.json({ admin: admins[0] });
  } catch (err) {
    console.error('Error en getAdminDetails:', err);
    res.status(500).json({ msg: 'Error interno al obtener detalles del administrador' });
  }
}