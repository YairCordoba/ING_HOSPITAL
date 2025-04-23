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
      expiresIn: 3599,    //segundos OJO
      admin: { id: admin.id_admin, name: admin.name }
    });
  } catch (err) {
    console.error('Error en login SuperAdmin:', err);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
}

export async function createDoctor(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id_card,
      name,
      email,
      password,       // ya viene hasheada desde el frontend
      specialization,
      phone
    } = req.body;

    // 1) Insertar en doctors
    const [doctorResult] = await conn.query(
      `INSERT INTO doctors
       (id_card, name, email, password, specialization, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_card, name, email, password, specialization, phone]
    );

    // 2) Insertar en users
    await conn.query(
      `INSERT INTO users
       (id_card, name, email, password, role)
       VALUES (?, ?, ?, ?, 'Doctor')`,
      [id_card, name, email, password]
    );

    await conn.commit();
    res.status(201).json({ msg: 'Doctor creado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en createDoctor:', err);
    // Errores de duplicado:
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ msg: 'Cédula o email ya registrados' });
    }
    res.status(500).json({ msg: 'Error interno al crear doctor' });
  } finally {
    conn.release();
  }
}
export async function listDoctors(req, res) {
  try {
    // desestructuramos rows de la promesa
    const [rows] = await db.query(
      'SELECT id_doctor, id_card, name, email, specialization, phone FROM doctors'
    );
    // enviamos directamente el array de doctores
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener doctores:', err);
    res.status(500).json({ msg: 'Error interno al obtener doctores' });
  }
}
export async function createPatient(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id_card,
      name,
      email,
      password,       //la contra ya debe venir hasheada
      blood_type,
      birth_date,
      occupation,
      marital_status,
      address,
      phone,
      id_doctor
    } = req.body;

    //Insertar en patients
    await conn.query(
      `INSERT INTO patients
       (id_card, name, email, password,
        blood_type, birth_date, occupation,
        marital_status, address, phone, id_doctor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_card, name, email, password,
        blood_type, birth_date, occupation,
        marital_status, address, phone, id_doctor
      ]
    );

    //Insertar en users
    await conn.query(
      `INSERT INTO users
       (id_card, name, email, password, role)
       VALUES (?, ?, ?, ?, 'Patient')`,
      [ id_card, name, email, password ]
    );
    
    await conn.commit();
    res.status(201).json({ msg: 'Paciente creado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en createPatient:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      // captura duplicados de cédula o email
      return res.status(409).json({ msg: 'Cédula o email ya registrados' });
    }
    res.status(500).json({ msg: 'Error interno al crear paciente' });
  } finally {
    conn.release();
  }
}

export async function createAdmin(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    console.log('Creando nuevo superadmin');
    const {
      id_card,
      name,
      email,
      password
    } = req.body;
    await conn.query(
    'INSERT INTO users (id_card, name, email, password, role) VALUES (?, ?, ?, ?, "Admin")',
    [id_card, name, email, password]);

  await conn.query(
  `INSERT INTO admins (id_card, name, email, password)
    VALUES (?, ?, ?, ?)`, [id_card, name, email, password]);

  console.log("✅ SuperAdmin creado correctamente");
  await conn.commit();
  res.status(201).json({ msg: 'Administrador creado correctamente' });
  }catch (err) {
    await conn.rollback();
    console.error('Error en createNewAdmin:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ msg: 'Cédula o email ya registrados' });
    }
    res.status(500).json({ msg: 'Error interno al crear administrador' });
  }
  finally {
    conn.release();
  } 
}

export async function createRelative(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const {
      id_card, name, email, password,
      address, phone, id_patient
    } = req.body;

    //Insertar en relatives
    await conn.query(
      `INSERT INTO relatives
       (id_card, name, email, password, address, phone, id_patient)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_card, name, email, password, address, phone, id_patient]
    );

    //Insertar en users
    await conn.query(
      `INSERT INTO users
       (id_card, name, email, password, role)
       VALUES (?, ?, ?, ?, 'Relative')`,
      [id_card, name, email, password]
    );

    await conn.commit();
    res.status(201).json({ msg: 'Familiar creado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en createRelative:', err);
    if (err.code==='ER_DUP_ENTRY') {
      return res.status(409).json({ msg: 'Cédula o email ya registrados' });
    }
    res.status(500).json({ msg: 'Error interno al crear familiar' });
  } finally {
    conn.release();
  }
}

export async function listPatientsWithoutRelative(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id_patient, id_card, name, address
       FROM patients
       WHERE id_patient NOT IN (
         SELECT id_patient FROM relatives
       )`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener pacientes sin familiar:', err);
    res.status(500).json({ msg: 'Error interno al obtener pacientes' });
  }
}

export async function getDoctorDetails(req, res) {
  const id = req.params.id;
  try {
    //Datos del doctor
    const [doctors] = await db.query(
      `SELECT id_doctor AS id, id_card, name, email, specialization, phone
       FROM doctors WHERE id_doctor = ?`,
      [id]
    );
    if (!doctors.length) return res.status(404).json({ msg: 'Doctor no encontrado' });
    const doctor = doctors[0];

    //Pacientes a cargo
    const [patients] = await db.query(
      `SELECT p.id_patient AS id, p.name, p.id_card
       FROM patients p
       WHERE p.id_doctor = ?`,
      [id]
    );

    res.json({ doctor, patients });
  } catch (err) {
    console.error('Error en getDoctorDetails:', err);
    res.status(500).json({ msg: 'Error interno al obtener detalles' });
  }
}

export async function getPatientDetails(req, res) {
  const id = req.params.id;  
  try {
    //Datos principales del paciente
    const [[patient]] = await db.query(
      `SELECT p.id_patient AS id, p.id_card, p.name, p.email,
              p.blood_type, p.birth_date, p.occupation,
              p.marital_status, p.address, p.phone, p.id_doctor
       FROM patients p
       WHERE p.id_patient = ?`,
      [id]
    );
    if (!patient) return res.status(404).json({ msg: 'Paciente no encontrado' });

    //Familiares (puede ser 0 o varios)
    const [relatives] = await db.query(
      `SELECT id_relative AS id, name, id_card
       FROM relatives
       WHERE id_patient = ?`,
      [id]
    );

    //Doctor a cargo
    const [[doctor]] = await db.query(
      `SELECT id_doctor AS id, name, specialization, phone, id_card
       FROM doctors
       WHERE id_doctor = ?`,
      [patient.id_doctor]
    );

    //ultimos signos vitales (puedes ajustar ORDER BY/limit si quieres sólo el último)
    const [vitals] = await db.query(
      `SELECT id_vital AS id,
              measurement_date, measurement_time,
              heart_rate, temperature, blood_pressure,
              respiratory_rate, weight, observations
       FROM vital_signs
       WHERE id_patient = ?
       ORDER BY measurement_date DESC, measurement_time DESC`,
      [id]
    );

    //Citas del paciente
    const [appointments] = await db.query(
      `SELECT id_appointment AS id,
              appointment_date, appointment_time, status
       FROM appointments
       WHERE id_patient = ?`,
      [id]
    );

    res.json({ patient, relatives, doctor, vitals, appointments });
  } catch (err) {
    console.error('Error en getPatientDetails:', err);
    res.status(500).json({ msg: 'Error interno al obtener detalles' });
  }
}

export async function getRelativeDetails(req, res) {
  const id = req.params.id;
  try {
    const [relatives] = await db.query(
      `SELECT id_relative AS id, id_card, name, email, phone, address, id_patient
       FROM relatives WHERE id_relative = ?`,
      [id]
    );

    if (!relatives.length) return res.status(404).json({ msg: 'Familiar no encontrado' });

    const relative = relatives[0];

    //Obtener el paciente asignado
    let patient = null;
    if (relative.id_patient) {
      const [patients] = await db.query(
        `SELECT id_patient AS id, name, id_card FROM patients WHERE id_patient = ?`,
        [relative.id_patient]
      );
      patient = patients[0] || null;
    }

    res.json({ relative, patient });
  } catch (err) {
    console.error('Error en getRelativeDetails:', err);
    res.status(500).json({ msg: 'Error interno al obtener detalles' });
  }
}

export async function getAdminDetails(req, res) {
  const id = req.params.id;
  try {
    const [admins] = await db.query(
      `SELECT id_admin AS id, name, email, id_card FROM admins WHERE id_admin = ?`,
      [id]
    );

    if (!admins.length) return res.status(404).json({ msg: 'Administrador no encontrado' });

    res.json({ admin: admins[0] });
  } catch (err) {
    console.error('Error en getAdminDetails:', err);
    res.status(500).json({ msg: 'Error interno al obtener detalles del administrador' });
  }
}


export async function updateDoctor(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id_doctor, //si ya existe viene diligenciado
      id_card,
      name,
      email,
      password,
      specialization,
      phone,
      original_id_card
    } = req.body;
  //MANDAR IGUALMENTE EL ID CARD PARA UPDATE
      // 1) Actualizar el doctor
      let pass =  password ? ' , password = ? ': '' // si el password viene es porque lo estan actualizando
      let query =  `UPDATE doctors set id_card = ?, name = ?, specialization  = ?, phone = ?, email = ? ` + pass +  ` WHERE id_doctor = ?`
      let params = password ? [ id_card, name, specialization, phone, email, password, id_doctor] : [ id_card, name, specialization, phone, email, id_doctor]
      await conn.query(
        query,
        params
      );
      // 2) Actualizar en users 
      let pass2 =  password ? ' , password = ? ': '' // si el password viene es porque lo estan actualizando
      let query2 = `UPDATE users set name = ?, email = ?, id_card = ? ` + pass +  ` where id_card = ? and role = 'Doctor' ` 
      let params2 = password ? [name, email,id_card, password, original_id_card] : [name, email,id_card, original_id_card]
      await conn.query(
        query2,
        params2
      );
    
    await conn.commit();
    res.status(204).json({ msg: 'Doctor actualizado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en updateDoctor:', err);
    // Errores de duplicado:
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ msg: 'Cédula o email ya registrados' });
    }
    res.status(500).json({ msg: 'Error interno al actualizar doctor' });
  } finally {
    conn.release();
  }
}

export async function updatePatient(req, res) {
  console.log('updatePatient')
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id_patient, 
      id_card,
      name,
      email,
      password,
      blood_type,
      birth_date,
      occupation,
      marital_status,
      address,
      phone,
      id_doctor,
      original_id_card
    } = req.body;
  
    console.log(req.body)
      //  Actualizar en tabla patients
      let pass =  password ? ' , password = ? ': '' // si el password viene es porque lo estan actualizando
      let query = `UPDATE patients set id_card = ?, name = ?, email = ?, blood_type = ?, birth_date = ?, 
      occupation = ?, marital_status = ?, address = ?, phone = ?, id_doctor = ? ` + pass +  ` WHERE id_patient = ?`
      let params = password ? [ id_card, name, email, blood_type, birth_date, occupation, marital_status,
        address, phone, id_doctor, password, id_patient] : [ id_card, name, email, blood_type, birth_date, occupation, marital_status,
          address, phone, id_doctor, id_patient]
      await conn.query(
        query,
        params
      );

      // 2) Actualizar en users 
      let query2 = `UPDATE users set name = ?, email = ?, id_card = ? ` + pass +  ` where id_card = ? and role = 'Patient' ` 
      let params2 = password ? [name, email,id_card, password, original_id_card] : [name, email,id_card, original_id_card]
      await conn.query(
        query2,
        params2
      );
    
    await conn.commit();
    res.status(204).json({ msg: 'Paciente actualizado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en updatePatient:', err);
    // Errores de duplicado:
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ msg: 'Cédula o email ya registrados' });
    }
    res.status(500).json({ msg: 'Error interno al actualizar paciente' });
  } finally {
    conn.release();
  }
}

export async function updateRelative(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id_relative,
      id_card,
      name,
      email,
      password,
      address,
      phone,
      id_patient,
      original_id_card
    } = req.body;

    console.log('original_id_card:' + original_id_card)
    console.log('id_card:' + id_card)
    // se actualiza en tabla relatives
    let pass =  password ? ' , password = ? ': '' // si el password viene es porque lo estan actualizando
    let query = `UPDATE relatives set id_card = ?, name = ?, email = ?, address = ?, phone = ?, id_patient = ? ` + pass +  ` WHERE id_relative = ?`
    let params = password ? [id_card, name, email, address, phone, id_patient, password, id_relative] : [id_card, name, email, address, phone, id_patient, id_relative]
    await conn.query(
      query,
      params
    );

    // se actualiza en tabla users
    let query2 = `UPDATE users set name = ?, email = ?, id_card = ? ` + pass +  ` where id_card = ? and role = 'Relative' ` 
    let params2 = password ? [name, email,id_card, password, original_id_card] : [name, email,id_card, original_id_card]
    await conn.query(
      query2,
      params2
    );
    
    await conn.commit();
    res.status(204).json({ msg: 'Familiar actualizado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en updateRelative:', err);
    // Errores de duplicado:
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ msg: 'Cédula o email ya registrados' });
    }
    res.status(500).json({ msg: 'Error interno al actualizar familiar' });
  } finally {
    conn.release();
  }
}

export async function updateAdmin (req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id_admin,
      id_card,
      name,
      email,
      password,
      original_id_card
    } = req.body;

    //Actualizar en tabla users
    let pass = password ? ', password = ? ' : ''; // si el password viene es porque lo estan actualizando
    let query = `UPDATE users SET name = ?, email = ? ` + pass +  `, id_card = ? WHERE id_card = ? and role = 'Admin'`;
    let params = password ? [name, email, password, id_card, original_id_card] : [name, email, id_card, original_id_card];
    await conn.query(
      query, params
    );
    // Actualizar en tabla admins}
    
    let query2 = `UPDATE admins SET name = ?, email = ? ` + pass +  `, id_card = ? WHERE id_admin = ?`;
    let params2 = password ? [name, email, password, id_card, id_admin] : [name, email, id_card, id_admin];
    await conn.query(
      query2, params2
    );

    await conn.commit();
    res.status(204).json({ msg: 'Administrador actualizado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en updateSuperAdmin:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ msg: 'Email ya registrado' });
    }
    res.status(500).json({ msg: 'Error interno al actualizar administrador' });
  } finally {
    conn.release();
  }
};


export async function deleteDoctor(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id
    } = req.params;

    const [rows] = await db.query(
      'SELECT id_card FROM doctors where id_doctor = ?', [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    const idCard = rows[0].id_card;

    //borramos Doctor
      await conn.query(
        `DELETE FROM doctors WHERE id_doctor = ?`,
        [id]
      );
    // 2) Borramos en users 
      let query = `DELETE FROM users where id_card = ? and role = 'Doctor' ` 
      let params = [idCard]
      await conn.query(
        query,
        params
      );
    
    await conn.commit();
    res.status(204).json({ msg: 'Doctor borrado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en deleteDoctor:', err);
    return res.status(500).json({ msg: 'Error interno al borrar doctor' });
  } finally {
    conn.release();
  }
}

export async function deletePatient(req, res) {
  
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id
    } = req.params;
    console.log('Borrando paciente con id: '+ id)

    const [rows] = await db.query(
      'SELECT id_card FROM patients where id_patient = ?', [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Patient not found' });
    }
   
    const idCard = rows[0].id_card;

      //borramos en tabla paciente
      const [rowsDeleted] = await conn.query(
        `DELETE FROM patients WHERE id_patient = ?`,
        [id]
      );
    
      if (rowsDeleted.affectedRows === 0) {
        return res.status(404).json({ msg: 'Patient not found' });
      }
     // borramos en tabla users 
      let query = `DELETE FROM users where id_card = ? and role = 'Patient' ` 
      let params = [idCard]
      await conn.query(
        query,
        params
      );
    
      //Validamos si el paciente tiene familiares para borrarlos
      const [rows2] = await conn.query(
        'SELECT id_card FROM relatives where id_patient = ?', [id]
      );

      if (rows2.length > 0) {
        const idCardRelative = rows2[0].id_card;
        
        await conn.query(
          `DELETE FROM relatives WHERE id_patient = ?`,
          [id]
        );
        await conn.query(
          `DELETE FROM users WHERE id_card = ? and role = 'Relative'`,
          [idCardRelative]
        );
      }
      /*

      Ya no se usa porque los familiares no van a tener más de un paciente :/

      //verificamos si el familiar está encargado de más pacientes
      const [rows3] = await conn.query(
        'SELECT id_patient FROM relatives where id_card = ?', [idCardRelative]
      );
      if (rows3.length > 0) {
        return res.status(204).json({ msg: 'Paciente borrado correctamente' });
      }
      //si no lo está se borra de la tabla users
      */
     
    
    await conn.commit();
    res.status(204).json({ msg: 'Paciente borrado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en deletePatient:', err);
    return res.status(500).json({ msg: 'Error interno al borrar paciente' });
  } finally {
    conn.release();
  }
}

/*export async function deleteSuperAdmin (req, res) {
  
}*/

export async function reassignPatients(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id_doctor
    } = req.body;


      // 1) Actualizar el doctor generico -- OJO ID doctor 13
      await conn.query(
        `UPDATE patients set id_doctor = 13 WHERE id_doctor = ?`,
        [ id_doctor]
      );
    
    await conn.commit();
    res.status(204).json({ msg: 'Doctor generico asignado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en reasignarPacientes:', err);

    res.status(500).json({ msg: 'Error interno al reasignar pacientes doctor generico' });
  } finally {
    conn.release();
  }
}

