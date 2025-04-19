import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import superadminApi from '../services/superadminApi';
import '../styles/SuperAdminLogin.css';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await superadminApi.post('/login', { email, password });
      //Guardar token de jwt
      localStorage.setItem('token', data.token);
      localStorage.setItem('token_exp', Date.now() + data.expiresIn * 1000);
      localStorage.setItem('admin_name', data.admin.name);
      navigate('/superadmin');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error en el servidor');
      console.log(e)
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Bienvenido nuevamente Administrador</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br/>
          <input
            type="email"
            value={email}
            placeholder='email'
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label><br/>
          <input
            type="password"
            value={password}
            placeholder='contraseña'
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <br />
        <button type="submit" className='button'>Iniciar Sesión</button>
      </form>
    </div>
  );
}