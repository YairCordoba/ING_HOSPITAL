import { db } from '../index.js';

export async function getAllUsers(req, res) {
  try {
    const [rows] = await db.query('SELECT id_user, id_card, name, email, role FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ msg: 'Error interno al obtener usuarios' });
  }
}
