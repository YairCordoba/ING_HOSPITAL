// auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ msg: 'Token no proporcionado' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload; // Almacena el payload en req.admin para usarlo en las rutas
    //protegidas
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token inválido o expirado' });
  }
}
