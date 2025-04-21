//server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import apiRoutes from './routes/index.js';
import mysql from 'mysql2/promise';


const app = express();
app.use(cors());
app.use(express.json());

let db; 

async function initializeDatabase() {
  try {
    
    db = await mysql.createPool(process.env.DATABASE_URL + '&ssl={"rejectUnauthorized":true}');

    //Verificar la conexion a la base de datos
    const [rows] = await db.query('SELECT 1');
    if (rows) {
      console.log('✅ ¡Mera chimba, la conexion se estableció Pah!');
    }
  } catch (err) {
    console.error('❌ ¡Uy so! no se pudo conectar, solucione, pille el error: ', err.message);
    process.exit(1); 
  }
}

async function startServer() {

  //Inicializa la BD :)
  await initializeDatabase();

  //Rutas 
  app.use('/api', apiRoutes);

  
  //Consultas de ejemplo: [NO BORRAR SE USA PARA REALIZAR PRUEBAS]
  
  try {
    const [results] = await db.query('SELECT * FROM relatives');
    console.log('Ejemplo de consulta: ', results);
  } catch (err) {
    console.error('❌ Error en la consulta:', err.message);
  }


  //Prender el servidor :)
  const PORT = 8888;
  app.listen(PORT, () => {
    console.log(`🚀 Backend en puerto ${PORT}`);
  });
}

startServer();

//Exportamos la variable db para usarla en otros archivos
export { db };