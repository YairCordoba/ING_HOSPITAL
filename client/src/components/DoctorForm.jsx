// client/src/components/DoctorForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
import usersApi from '../services/usersApi';
import superadminApi from '../services/superadminApi';
import bcrypt from 'bcryptjs';
import '../styles/DoctorForm.css';

export default function DoctorForm({ idDoctor }) {
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDoctor() {
      if (idDoctor) {
        try {
          const { data } = await superadminApi.post('/doctor', {idDoctor: idDoctor});
          if (data) {
            setForm({
              id_doctor:data.id_doctor,
              id_card: data.id_card,
              name: data.name,
              email: data.email,
              password: data.password,
              confirm: data.password,
              specialization: data.specialization,
              phone: data.phone
            });
            setIsNew(false)
            setOriginalEmail(data.email)
          }
        } catch (err) {
          console.error('Error al traer doctores:', err);
        }
      }
    }
      fetchDoctor()
  }, [idDoctor])

  const [form, setForm] = useState({
    id_doctor: '',
    id_card: '',
    name: '',
    email: '',
    password: '',
    confirm: '',
    specialization: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isNew, setIsNew] = React.useState(true); 
  const [originalEmail, setOriginalEmail] = useState({});

  //Lista de especialidades
  const specialties = [
    'Anestesiología',
    'Cardiología',
    'Dermatología',
    'Endocrinología',
    'Ginecología',
    'Geriatría',
    'Infectología',
    'Medicina Familiar',
    'Medicina General',
    'Medicina Interna',
    'Neumología',
    'Neurología',
    'Odontología',
    'Oftalmología',
    'Oncología',
    'Otorrinolaringología',
    'Psiquiatría',
    'Traumatología',
    'Urología'
  ];

  const handleChange = e => {
    const { name, value } = e.target;

    // Sólo dígitos para cédula y teléfono
    if ((name === 'id_card' || name === 'phone') && /\D/.test(value)) {
      return;
    }
    // Máximo de caracteres
    if (name === 'id_card' && value.length > 20) return;
    if (name === 'phone'   && value.length > 15) return;
    if (name === 'email' && value.length > 60) return;
    if (name === 'name' && value.length > 70) return;
    if (name === 'password' && value.length > 20) return;
    if (name === 'confirm' && value.length > 20) return;

    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = async () => {
    const errs = {};
    const { id_card, name, email, password, confirm, specialization, phone } = form;

    if (!id_card || id_card.length < 7) errs.id_card = 'Cédula mínimo 7 dígitos';
    if (id_card.length > 20)   errs.id_card = 'Cédula máximo 20 dígitos';
    if (!name)                  errs.name    = 'Nombre requerido';
    if (!email || !validator.isEmail(email)) errs.email = 'Email inválido';
    if ((isNew && !password) || (password && password.length < 5))  errs.password = 'Mínimo 5 caracteres';
    if (confirm !== password)               errs.confirm  = 'No coincide con la contraseña';
    if (!specialization)                    errs.specialization = 'Especialidad requerida';
    if (!phone || phone.length < 7)         errs.phone    = 'Teléfono mínimo 7 dígitos';
    if (phone.length > 15)                  errs.phone    = 'Teléfono máximo 15 dígitos';

    // Validar unicidad
    if (email && validator.isEmail(email)) {
      if (isNew || originalEmail !== email) {
        const { data } = await usersApi.get(`/check-email?email=${email}`);
        if (data.exists) errs.email = 'Email ya registrado';
      }
    }
    if (isNew && id_card && id_card.length >= 6) {
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
      await superadminApi.post('/doctors', {
        id_card:      form.id_card,
        name:         form.name,
        email:        form.email,
        password:     hashed,
        specialization: form.specialization,
        phone:        form.phone
      });
      alert('Doctor creado correctamente ✅');
      setForm({
        id_card: '',
        name: '',
        email: '',
        password: '',
        confirm: '',
        specialization: '',
        phone: ''
      });
      setErrors({});
    } catch (err) {
      console.error('Error creando doctor:', err);
      alert(err.response?.data?.msg || 'Error al crear doctor');
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
    
    try {
        await superadminApi.put('/doctor', {
          id_doctor: form.id_doctor,
          id_card: form.id_card,
          name: form.name,
          email: form.email,
          password: hashed,
          specialization: form.specialization,
          phone: form.phone
        });
        //
        alert('Doctor actualizado correctamente ✅');
      
        navigate('/superadmin')
      } catch (err) {
        console.error('Error actualizando doctor:', err);
        alert(err.response?.data?.msg || 'Error al actualizar doctor');
      }
  };


  return (
    <form className="df-form" onSubmit={isNew ? handleSubmit : handleEdit}>
      <div className="df-row">
        <label>Cédula:</label>
        <input
          name="id_card"
          value={form.id_card}
          onChange={handleChange}
          maxLength={20}
          readOnly={!isNew} 
        />
        {errors.id_card && <small>{errors.id_card}</small>}
      </div>
      <div className="df-row">
        <label>Nombre:</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        {errors.name && <small>{errors.name}</small>}
      </div>
      <div className="df-row">
        <label>Email:</label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <small>{errors.email}</small>}
      </div>
      <div className="df-row">
        <label>Contraseña:</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
        {errors.password && <small>{errors.password}</small>}
      </div>
      <div className="df-row">
        <label>Repetir Contraseña:</label>
        <input
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
        />
        {errors.confirm && <small>{errors.confirm}</small>}
      </div>
      <div className="df-row">
        <label>Especialidad:</label>
        <select
          name="specialization"
          value={form.specialization}
          onChange={handleChange}
        >
          <option value="">-- Selecciona --</option>
          {specialties.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
        {errors.specialization && <small>{errors.specialization}</small>}
      </div>
      <div className="df-row">
        <label>Teléfono:</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          maxLength={15}
        />
        {errors.phone && <small>{errors.phone}</small>}
      </div>
      <button type="submit">{isNew ? "Crear Doctor" : "Editar Doctor"}</button>
      <button type="button"  onClick={() => navigate("/superadmin")}>Cancelar</button>
    </form>
  );
}
