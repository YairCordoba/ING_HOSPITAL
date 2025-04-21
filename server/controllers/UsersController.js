//server/controllers/usersController.js
import { db } from '../index.js';

export async function getAllUsers(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id_user,
        u.id_card,
        u.name,
        u.email,
        u.role,
        -- Subqueries para traer el ID de cada tabla dependiendo del rol
        CASE 
          WHEN u.role = 'Doctor' THEN (SELECT id_doctor FROM doctors d WHERE d.id_card = u.id_card)
          WHEN u.role = 'Patient' THEN (SELECT id_patient FROM patients p WHERE p.id_card = u.id_card)
          WHEN u.role = 'Relative' THEN (SELECT id_relative FROM relatives r WHERE r.id_card = u.id_card)
          WHEN u.role = 'Admin' THEN (SELECT id_admin FROM admins a WHERE a.id_card = u.id_card)
          ELSE NULL
        END AS role_specific_id
      FROM users u
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ msg: 'Error interno al obtener usuarios' });
  }
}


export async function checkEmailExists(req, res) {
  try {
    const { email } = req.query;
    const [rows] = await db.query(
      'SELECT 1 FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error interno al verificar email' });
  }
}

export async function checkCedulaExists(req, res) {
  try {
    const { id_card } = req.query;
    const [rows] = await db.query(
      'SELECT 1 FROM users WHERE id_card = ? LIMIT 1',
      [id_card]
    );
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error interno al verificar cedula' });
  }
}
