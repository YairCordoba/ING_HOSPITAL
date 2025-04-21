import React, { useState, useEffect } from 'react';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';
import usersApi from '../services/usersApi';
import superadminApi from '../services/superadminApi';
import bcrypt from 'bcryptjs';
import '../styles/PatientForm.css';

export default function PatientForm({idPatient}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    id_patient: '',
    id_card: '',
    name: '',
    email: '',
    password: '',
    confirm: '',
    blood_type: '',
    birth_date: '',
    occupation: '',
    marital_status: '',
    address: '',
    phone: '',
    id_doctor: '5'    //default "Sin asignar"
  });
  const [errors, setErrors] = useState({});
  const [doctors, setDoctors] = useState([]);

  //Opciones
  const bloodTypes = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
  const maritalOptions = ['Soltero/a','Casado/a','Divorciado/a','Viudo/a','Unión libre'];

  //Traer lista de doctores
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await superadminApi.get('/doctors');
        setDoctors(data);
      } catch (err) {
        console.error('Error al traer doctores:', err);
      }
      if (idPatient) {
        try {
          const { data } = await superadminApi.get('/patients/'+idPatient);
          if (data && data.patient) {
            setForm({
              id_patient:data.patient.id,
              id_card:data.patient.id_card,
              name:data.patient.name,
              email:data.patient.email,
              password:data.patient.password,
              confirm:data.patient.password,
              blood_type:data.patient.blood_type || '',
              birth_date:new Date(data.patient.birth_date).toISOString().split('T')[0] || '',
              occupation:data.patient.occupation || '',
              marital_status:data.patient.marital_status || '',
              address:data.patient.address || '',
              phone:data.patient.phone || '',
              id_doctor:data.patient.id_doctor
            });
          }
          setIsNew(false)
          setOriginalEmail(data.patient.email)
          setOriginalIdCard(data.patient.id_card)
        } catch (err) {
          console.error('Error al traer pacientes:', err);
        }
      }
    }
    fetchData();
  }, [idPatient]);

  const [originalEmail, setOriginalEmail] = useState({});
  const [originalIdCard, setOriginalIdCard] = useState({});
  const [isNew, setIsNew] = useState(true);

  const handleChange = e => {
    const { name, value } = e.target;
    if ((name==='id_card'||name==='phone') && /\D/.test(value)) return;
    //Validar longitud de caracteres
    if (name === 'id_card' && value.length > 20) return;
    if (name === 'phone' && value.length > 15) return;
    if (name === 'email' && value.length > 60) return;
    if (name === 'name' && value.length > 70) return;
    if (name === 'password' && value.length > 20) return;
    if (name === 'confirm' && value.length > 20) return;
    if (name === 'occupation' && value.length > 50) return;
    if (name === 'address' && value.length > 100) return;
    setForm(f => ({ ...f, [name]: value }));

  };

  const validate = async () => {
    const errs = {};
    const {
      id_card,name,email,password,confirm,
      blood_type,birth_date,occupation,marital_status,address,phone
    } = form;

    if (!id_card || id_card.length < 7) errs.id_card = 'Cédula mínimo 7 dígitos';
    if (id_card.length > 20)   errs.id_card = 'Cédula máximo 20 dígitos';
    if (!name) errs.name = 'Nombre requerido';
    if (!email || !validator.isEmail(email)) errs.email = 'Email inválido';
    if ((isNew && !password) || (password && password.length < 5))  errs.password = 'Mínimo 5 caracteres';
    if (confirm !== password) errs.confirm = 'Las contraseñas no coinciden';
    if (!blood_type) errs.blood_type = 'Tipo de sangre requerido';
    if (!birth_date) errs.birth_date = 'Fecha de nacimiento requerida';
    if (!occupation) errs.occupation = 'Ocupación requerida';
    if (!marital_status) errs.marital_status = 'Estado civil requerido';
    if (!address) errs.address = 'Dirección requerida';
    if (!phone || phone.length < 7) errs.phone = 'Teléfono mínimo 7 dígitos';

    // unicidad email y cédula en tabla users
    if (email && validator.isEmail(email)) {
      if (isNew || originalEmail !== email) {
        const { data } = await usersApi.get(`/check-email?email=${email}`);
        if (data.exists) errs.email = 'Email ya registrado';
      }
    }

    if (isNew || originalIdCard !== id_card) {
      const { data } = await usersApi.get(`/check-cedula?id_card=${id_card}`);
      if (data.exists) errs.id_card = 'Cédula ya registrada';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!(await validate())) return;

    const hashed = await bcrypt.hash(form.password, 10);

    try {
      await superadminApi.post('/patients', {
        id_card: form.id_card,
        name: form.name,
        email: form.email,
        password: hashed,
        blood_type: form.blood_type,
        birth_date: form.birth_date,
        occupation: form.occupation,
        marital_status: form.marital_status,
        address: form.address,
        phone: form.phone,
        id_doctor: form.id_doctor
      });
      alert('Paciente creado correctamente');
      //limpiar formulario
      setForm({
        id_card:'',name:'',email:'',password:'',confirm:'',
        blood_type:'',birth_date:'',occupation:'',
        marital_status:'',address:'',phone:'',id_doctor:'5'
      });
      setErrors({});
    } catch (err) {
      console.error('Error creando paciente:', err);
      alert(err.response?.data?.msg || 'Error al crear paciente');
    }
  };

  const handleEdit = async e => {
    e.preventDefault();
    if (!(await validate())) return;

    let hashed = form.password
    //Si el usuario cambio la contraseña hay que Hashshearla
    if (hashed) { 
      hashed = await bcrypt.hash(form.password, 10);
    }
    alert('originalIdCard: ' + originalIdCard)
    try {
      await superadminApi.put('/patient', {
        id_patient: form.id_patient,
        id_card: form.id_card,
        name: form.name,
        email: form.email,
        password: hashed,
        blood_type: form.blood_type,
        birth_date: form.birth_date,
        occupation: form.occupation,
        marital_status: form.marital_status,
        address: form.address,
        phone: form.phone,
        id_doctor: form.id_doctor,
        original_id_card: originalIdCard
      });
      alert('Paciente Editado correctamente');
      navigate('/superadmin')
    } catch (err) {
      console.error('Error editando paciente:', err);
      alert(err.response?.data?.msg || 'Error al editar paciente');
    }
  };

  return (
    <form className="pf-form" onSubmit={isNew ? handleSubmit: handleEdit}>
      <div className="pf-row">
        <label>Cédula:</label>
        <input name="id_card" value={form.id_card} onChange={handleChange} />
        {errors.id_card && <small>{errors.id_card}</small>}
      </div>
      <div className="pf-row">
        <label>Nombre:</label>
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <small>{errors.name}</small>}
      </div>
      <div className="pf-row">
        <label>Email:</label>
        <input name="email" value={form.email} onChange={handleChange} />
        {errors.email && <small>{errors.email}</small>}
      </div>
      <div className="pf-row">
        <label>Contraseña:</label>
        <input type="password" name="password" value={form.password} onChange={handleChange}/>
        {errors.password && <small>{errors.password}</small>}
      </div>
      <div className="pf-row">
        <label>Repetir Contraseña:</label>
        <input type="password" name="confirm" value={form.confirm} onChange={handleChange}/>
        {errors.confirm && <small>{errors.confirm}</small>}
      </div>
      <div className="pf-row">
        <label>Tipo de Sangre:</label>
        <select name="blood_type" value={form.blood_type} onChange={handleChange}>
          <option value="">--</option>
          {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
        </select>
        {errors.blood_type && <small>{errors.blood_type}</small>}
      </div>
      <div className="pf-row">
        <label>Fecha de Nacimiento:</label>
        <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} />
        {errors.birth_date && <small>{errors.birth_date}</small>}
      </div>
      <div className="pf-row">
        <label>Ocupación:</label>
        <input name="occupation" value={form.occupation} onChange={handleChange}/>
        {errors.occupation && <small>{errors.occupation}</small>}
      </div>
      <div className="pf-row">
        <label>Estado Civil:</label>
        <select name="marital_status" value={form.marital_status} onChange={handleChange}>
          <option value="">--</option>
          {maritalOptions.map(ms => <option key={ms} value={ms}>{ms}</option>)}
        </select>
        {errors.marital_status && <small>{errors.marital_status}</small>}
      </div>
      <div className="pf-row">
        <label>Dirección:</label>
        <input name="address" value={form.address} onChange={handleChange}/>
        {errors.address && <small>{errors.address}</small>}
      </div>
      <div className="pf-row">
        <label>Teléfono:</label>
        <input name="phone" value={form.phone} onChange={handleChange}/>
        {errors.phone && <small>{errors.phone}</small>}
      </div>
      <div className="pf-row">
        <label>Doctor a Cargo:</label>
        <select name="id_doctor" value={form.id_doctor} onChange={handleChange}>
          <option value="5">Sin asignar</option>
          {doctors.length===0
            ? <option disabled>No hay doctores disp.</option>
            : doctors.map(d => (
                <option key={d.id_doctor} value={d.id_doctor}>
                  {d.name} / {d.specialization}
                </option>
              ))
          }
        </select>
      </div>
      <button type="submit">{isNew ? "Crear Paciente" : "Editar Paciente"}</button>

      <button type="button"  onClick={() => navigate("/superadmin")}>Cancelar</button>
    </form>
  );
}
