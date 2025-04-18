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
