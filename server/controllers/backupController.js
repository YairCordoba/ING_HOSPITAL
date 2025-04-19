// server/controllers/backupController.js
import { db } from '../index.js';
import ExcelJS from 'exceljs';

export async function backupDatabase(req, res) {
  try {
    //Tablas de la BD::
    const tables = [
      'admins',
      'doctors',
      'patients',
      'relatives',
      'appointments',
      'users',
      'vital_signs'
    ];

    const workbook = new ExcelJS.Workbook();

    for (const table of tables) {
      //Obtener datos de la tabla
      const [rows] = await db.query(`SELECT * FROM \`${table}\``);

      //Crear hoja de trabajo para cada tabla
      const sheet = workbook.addWorksheet(table);

      if (rows.length) {
        //Definir columnas segun keys del primer registro
        sheet.columns = Object.keys(rows[0]).map(key => ({
          header: key,
          key
        }));
        //Añadir todas las filas
        sheet.addRows(rows);
      }
    }

    //Preparar respuesta como XLSX
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="backup.xlsx"'
    );

    //Escribir directamente al stream de respuesta
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error generando backup:', err);
    //sino un JSON con error
    res.status(500).json({ msg: 'No se pudo generar la copia de seguridad.' });
  }
}
