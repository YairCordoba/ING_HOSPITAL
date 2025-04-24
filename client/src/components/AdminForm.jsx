import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
import usersApi from '../services/usersApi';
import superadminApi from '../services/superadminApi';
import bcrypt from 'bcryptjs';
import '../styles/SuperAdminForm.css';     

export default function SuperAdminForm({ idAdmin }) {
  const navigate = useNavigate();
  const[modified, setModified] = useState(false);
  const [errors, setErrors] = useState({});
  const [isNew, setIsNew] = useState(true);
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalIdCard, setOriginalIdCard] = useState("");

  useEffect(() => {
    async function fetchData() {

      if (idAdmin) {
        try {
          const { data } = await superadminApi.get('/admins/'+idAdmin); 
          if (data && data.admin) {
            setForm({
              id_admin:data.admin.id,
              id_card: data.admin.id_card,
              name: data.admin.name,
              email: data.admin.email,
              password:'',
              confirm:'',
            });
            setIsNew(false)
            setOriginalEmail(data.admin.email)
            setOriginalIdCard(data.admin.id_card)
          }
        } catch (err) {
          console.error('Error al traer administradores:', err);
        }
      }
    }
      fetchData()
  }, [idAdmin])
    const [form, setForm] = useState({
        id_admin: '',
        id_card: '',
        name: '',
        email: '',
        password: '',
        confirm: ''
    });

   

    const handleChange = (e) => {
        setModified(true);
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
        const { id_card, name, email, password, confirm} = form;
    
        if (!id_card || id_card.length < 7) errs.id_card = 'Cédula mínimo 7 dígitos';
        if (id_card.length > 20)   errs.id_card = 'Cédula máximo 20 dígitos';
        if (!name)                  errs.name    = 'Nombre requerido';
        if (!email || !validator.isEmail(email)) errs.email = 'Email inválido';
        if ((isNew && !password) || (password && password.length < 5))  errs.password = 'Mínimo 5 caracteres';
        if (confirm !== password)               errs.confirm  = 'No coincide con la contraseña';
    
        // Validar unicidad
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

    

      const handleEdit = async (e) => {
        e.preventDefault();
        if(!modified) {
            alert('No se han realizado cambios en el formulario.');
            return;
        }

        if (!(await validate())) return;

        let hashed = form.password;
        if(hashed) {
            hashed = await bcrypt.hash(form.password, 10);
        }
        try {
            await superadminApi.put('/admin', {
              id_admin: form.id_admin,
              id_card: form.id_card,
              name: form.name,
              email: form.email,
              password: hashed,
              original_id_card: originalIdCard
            });
            
            alert('Administrador actualizado correctamente ✅');
          
            navigate('/superadmin')
          } catch (err) {
            console.error('Error actualizando administrador:', err);
            alert(err.response?.data?.msg || 'Error al actualizar administrador');
        }
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!(await validate())) return;

        const hashed = await bcrypt.hash(form.password, 10);

        try {
          await superadminApi.post('/admins', {
            id_card: form.id_card,
            name: form.name,
            email: form.email,
            password: hashed
          });
          alert('Administrador creado correctamente ✅');
          setForm({
            id_card: '',
            name: '',
            email: '',
            password: '',
            confirm: ''
          });
          setErrors({});
        } catch (err) {
          console.error('Error creando administrador:', err);
          alert(err.response?.data?.msg || 'Error al crear administrador');
        }

        navigate('/superadmin');
      };

      return (
        <form className="sa-form" onSubmit={isNew ? handleSubmit : handleEdit}>
          <div className="sa-row">
            <label>Cédula:</label>
            <input name="id_card" value={form.id_card} onChange={handleChange} />
            {errors.id_card && <small>{errors.id_card}</small>}
          </div>
          <div className="sa-row">
            <label>Nombre:</label>
            <input name="name" value={form.name} onChange={handleChange} />
            {errors.name && <small>{errors.name}</small>}
          </div>
          <div className="sa-row">
            <label>Email:</label>
            <input name="email" value={form.email} onChange={handleChange} />
            {errors.email && <small>{errors.email}</small>}
          </div>
          
          <div className="sa-row">
            <label>Contraseña:</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}/>
            {errors.password && <small>{errors.password}</small>}
          </div>
          <div className="sa-row">
            <label>Repetir Contraseña:</label>
            <input type="password" name="confirm" value={form.confirm} onChange={handleChange}/>
            {errors.confirm && <small>{errors.confirm}</small>}
          </div>
          
          <button type="submit">{isNew ? "Crear Administrador" : "Editar Administrador"}</button>
          <button type="button"  onClick={() => navigate("/superadmin")}>Cancelar</button>
        </form>
      );
}



  
