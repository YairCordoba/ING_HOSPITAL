import React, { useState } from 'react';
import validator from 'validator';
import usersApi from '../services/usersApi';      //Para chequear email/cédula y crear usuario
import superadminApi from '../services/superadminApi'; //crear doctor
import bcrypt from 'bcryptjs';
import '../styles/DoctorForm.css';

export default function DoctorForm() {
  const [form, setForm] = useState({
    id_card: '',
    name: '',
    email: '',
    password: '',
    confirm: '',
    specialization: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    //Solo números para cedula y celuco
    if ((name === 'id_card' || name === 'phone') && /\D/.test(value)) return;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = async () => {
    const errs = {};
    const { id_card, name, email, password, confirm, specialization, phone } = form;

    if (!id_card || id_card.length < 7) errs.id_card = 'Cédula mínimo 7 dígitos';
    if (!name) errs.name = 'Nombre requerido';
    if (!email || !validator.isEmail(email)) errs.email = 'Email inválido';
    if (!password || password.length < 5) errs.password = 'Mínimo 5 caracteres';
    if (confirm !== password) errs.confirm = 'No coincide con la contraseña';
    if (!specialization) errs.specialization = 'Especialidad requerida';
    if (!phone || phone.length < 7) errs.phone = 'Teléfono mínimo 7 dígitos';

    //Validar email unico
    if (email && validator.isEmail(email)) {
      const { data } = await usersApi.get(`/check-email?email=${email}`);
      if (data.exists) errs.email = 'Email ya registrado';
    }
    if (id_card && id_card.length >= 6) {
      const { data } = await usersApi.get(`/check-cedula?id_card=${id_card}`);
      if (data.exists) errs.id_card = 'Cédula ya registrada';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!(await validate())) return;

    //Hashshear la contraseña
    const hashed = await bcrypt.hash(form.password, 10);

    //Enviar añ backend
    try {
      await superadminApi.post('/doctors', {
        id_card: form.id_card,
        name: form.name,
        email: form.email,
        password: hashed,
        specialization: form.specialization,
        phone: form.phone
      });
      //
      alert('Doctor creado correctamente ✅');
      //Limpiar el formulario:
      setForm({
        id_card: '',
        name: '',
        email: '',
        password: '',
        confirm: '',
        specialization: '',
        phone: ''
      });
    } catch (err) {
      console.error('Error creando doctor:', err);
      alert(err.response?.data?.msg || 'Error al crear doctor');
    }
  };

  return (
    <form className="df-form" onSubmit={handleSubmit}>
      <div className="df-row">
        <label>Cédula:</label>
        <input name="id_card" value={form.id_card} onChange={handleChange} />
        {errors.id_card && <small>{errors.id_card}</small>}
      </div>
      <div className="df-row">
        <label>Nombre:</label>
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <small>{errors.name}</small>}
      </div>
      <div className="df-row">
        <label>Email:</label>
        <input name="email" value={form.email} onChange={handleChange} />
        {errors.email && <small>{errors.email}</small>}
      </div>
      <div className="df-row">
        <label>Contraseña:</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} />
        {errors.password && <small>{errors.password}</small>}
      </div>
      <div className="df-row">
        <label>Repetir Contraseña:</label>
        <input type="password" name="confirm" value={form.confirm} onChange={handleChange} />
        {errors.confirm && <small>{errors.confirm}</small>}
      </div>
      <div className="df-row">
        <label>Especialidad:</label>
        <input name="specialization" value={form.specialization} onChange={handleChange} />
        {errors.specialization && <small>{errors.specialization}</small>}
      </div>
      <div className="df-row">
        <label>Teléfono:</label>
        <input name="phone" value={form.phone} onChange={handleChange} />
        {errors.phone && <small>{errors.phone}</small>}
      </div>
      <button type="submit">Crear Doctor</button>
    </form>
  );
}
