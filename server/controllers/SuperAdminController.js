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
      expiresIn: 3600,    //segundos OJO
      admin: { id: admin.id_admin, name: admin.name }
    });
  } catch (err) {
    console.error('Error en login SuperAdmin:', err);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
}

export const createDoctor = (req, res) => { /* lógica */ };
export const listDoctors = (req, res) => { /* lógica */ };
