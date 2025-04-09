import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/login', { email, password });
      //Guardar token de jwt
      localStorage.setItem('token', data.token);
      localStorage.setItem('token_exp', Date.now() + data.expiresIn * 1000);
      localStorage.setItem('admin_name', data.admin.name);
      navigate('/superadmin');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error en el servidor');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Login SuperAdmin</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br/>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label><br/>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}
