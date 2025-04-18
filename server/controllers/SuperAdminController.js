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