import { db } from '../index.js';

export async function getPatientbyID(req, res) {
    try {
        const { id_card } = req.params;
        const [rows] = await db.query('SELECT id_patient, id_card, name, email, password, blood_type, birth_date, occupation, marital_status, address, phone, id_doctor FROM patients WHERE id_card = ?', [id_card]);
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Paciente no encontrado' });
        }
      res.json(rows);
      //verificar si rows tiene datos
      console.log(rows);
    } catch (err) {
        //manejo de errores
        console.log(err);
      console.error('Error al obtener paciente:', err);
      res.status(500).json({ msg: 'Error interno al obtener paciente' });
    }
  }