import React, { useState, useEffect } from 'react';
import validator from 'validator';
import usersApi from '../services/usersApi';
import superadminApi from '../services/superadminApi';
import bcrypt from 'bcryptjs';
import '../styles/RelativeForm.css';

export default function RelativeForm() {
  const [form, setForm] = useState({
    id_card: '',
    name: '',
    email: '',
    password: '',
    confirm: '',
    id_patient: '',
    address: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  //Traer pacientes sin familiar :(
  useEffect(() => {
    async function fetchPatients() {
      try {
        const { data } = await superadminApi.get('/patients/without-relative');
        setPatients(data);
      } catch (err) {
        console.error('Error trayendo pacientes:', err);
      }
    }
    fetchPatients();
  }, []);

  //Al cambiar el select de paciente, sincronizamos id y dirección
  const onPatientChange = e => {
    const id = e.target.value;
    const paciente = patients.find(p => String(p.id_patient) === id);
    setForm(f => ({
      ...f,
      id_patient: id,
      address: paciente ? paciente.address : ''
    }));
    setErrors(err => ({ ...err, id_patient: '' }));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    //Solo números en id_card y phone
    if ((name === 'id_card' || name === 'phone') && /\D/.test(value)) return;
    //Validar longitud de caracteres
    if (name === 'id_card' && value.length > 20) return;
    if (name === 'phone' && value.length > 15) return;
    if (name === 'email' && value.length > 60) return;
    if (name === 'name' && value.length > 70) return;
    if (name === 'password' && value.length > 20) return;
    if (name === 'confirm' && value.length > 20) return;
    if (name === 'address' && value.length > 100) return;
    if (name === 'occupation' && value.length > 50) return;
    if (name === 'phone' && value.length > 15) return;
    setForm(f => ({ ...f, [name]: value }));
  };

  //Validaciones
  const validate = async () => {
    const errs = {};
    const { id_card, name, email, password, confirm, id_patient, phone } = form;

    if (!id_card || id_card.length < 6) errs.id_card = 'Cédula mínimo 6 dígitos';
    if (!name) errs.name = 'Nombre requerido';
    if (!email || !validator.isEmail(email)) errs.email = 'Email inválido';
    if (!password || password.length < 5) errs.password = 'Mínimo 5 caracteres';
    if (confirm !== password) errs.confirm = 'No coincide';
    if (!id_patient) errs.id_patient = 'Debe asignar un paciente';
    if (!phone || phone.length < 6) errs.phone = 'Teléfono mínimo 6 dígitos';

    //Unicidad email
    if (email && validator.isEmail(email)) {
      const { data } = await usersApi.get(`/check-email?email=${email}`);
      if (data.exists) errs.email = 'Email ya registrado';
    }
    //Unicidad cédula
    if (id_card && id_card.length >= 6) {
      const { data } = await usersApi.get(`/check-cedula?id_card=${id_card}`);
      if (data.exists) errs.id_card = 'Cédula ya registrada';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  //Envio :)
  const handleSubmit = async e => {
    e.preventDefault();
    if (!(await validate())) return;
    const hashed = await bcrypt.hash(form.password, 10);

    try {
      await superadminApi.post('/relatives', {
        id_card: form.id_card,
        name: form.name,
        email: form.email,
        password: hashed,
        address: form.address,
        phone: form.phone,
        id_patient: form.id_patient
      });
      alert('Familiar creado correctamente');
      //Limpiar form
      setForm({
        id_card: '', name: '', email: '', password: '',
        confirm: '', id_patient: '', address: '', phone: ''
      });
      setSearch('');
      setErrors({});
    } catch (err) {
      console.error('Error creando familiar:', err);
      alert(err.response?.data?.msg || 'Error al crear familiar');
    }
  };

  //Filtrado en base a search :o
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id_card.includes(search)
  );

  return (
    <form className="rf-form" onSubmit={handleSubmit}>
      <div className="rf-row">
        <label>Cédula:</label>
        <input name="id_card" value={form.id_card} onChange={handleChange} />
        {errors.id_card && <small>{errors.id_card}</small>}
      </div>
      <div className="rf-row">
        <label>Nombre:</label>
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <small>{errors.name}</small>}
      </div>
      <div className="rf-row">
        <label>Email:</label>
        <input name="email" value={form.email} onChange={handleChange} />
        {errors.email && <small>{errors.email}</small>}
      </div>
      <div className="rf-row">
        <label>Contraseña:</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} />
        {errors.password && <small>{errors.password}</small>}
      </div>
      <div className="rf-row">
        <label>Repetir Contraseña:</label>
        <input type="password" name="confirm" value={form.confirm} onChange={handleChange} />
        {errors.confirm && <small>{errors.confirm}</small>}
      </div>

      {/* Búsqueda integrada */}
      <div className="rf-row">
        <label>Buscar Paciente:</label>
        <input
          placeholder="Nombre o Cédula..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Desplegable filtrado */}
      <div className="rf-row">
        <label>Asignar Paciente:</label>
        <select value={form.id_patient} onChange={onPatientChange}>
          <option value="">--</option>
          {filtered.length > 0 ? (
            filtered.map(p => (
              <option key={p.id_patient} value={p.id_patient}>
                {p.name} / {p.id_card}
              </option>
            ))
          ) : (
            <option disabled>No hay pacientes disponibles</option>
          )}
        </select>
        {errors.id_patient && <small>{errors.id_patient}</small>}
      </div>

      <div className="rf-row">
        <label>Dirección:</label>
        <input value={form.address} readOnly />
      </div>
      <div className="rf-row">
        <label>Teléfono:</label>
        <input name="phone" value={form.phone} onChange={handleChange} />
        {errors.phone && <small>{errors.phone}</small>}
      </div>
      <button type="submit">Crear Familiar</button>
    </form>
  );
}
