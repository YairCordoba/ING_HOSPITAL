import { db } from "./index.js";
import bcrypt from 'bcrypt';

async function crearSuperAdmin(id_card, name, email, passwordPlano) {
  const hash = await bcrypt.hash(passwordPlano, 10);
  /* para añadir un superadmin a la tabla de usuarios

  codigo para llamar a la funcion
  crearSuperAdmin('1036677553', 'Juan Henao', 'adminjuan@gmail.com', 'password');
  
  const sql = 
    'INSERT INTO users (id_card, name, email, password, role) VALUES (?, ?, ?, ?, "Admin")';
  await db.execute(sql, [id_card, name, email, hash]);*/
  const sql2 = 
  `INSERT INTO admins (id_card, name, email, password)
    VALUES (?, ?, ?, ?)`
  await db.execute(sql2, [id_card, name, email, hash]);
  

  
  console.log("✅ SuperAdmin creado correctamente");
}

export default crearSuperAdmin;