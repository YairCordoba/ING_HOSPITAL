import { db } from "./index.js";
import bcrypt from 'bcrypt';

async function crearSuperAdmin(id_card, name, email, passwordPlano) {
  const hash = await bcrypt.hash(passwordPlano, 10);
  const sql = `
    INSERT INTO admins (id_card, name, email, password)
    VALUES (?, ?, ?, ?)
  `;
  await db.execute(sql, [id_card, name, email, hash]);
  console.log("✅ SuperAdmin creado correctamente");
}

export default crearSuperAdmin;