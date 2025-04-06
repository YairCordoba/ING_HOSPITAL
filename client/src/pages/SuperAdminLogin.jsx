// client/src/pages/SuperAdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    // Aquí harías tu fetch/axios a /api/superadmin/login
    // Por ahora simulamos login exitoso:
    navigate('/superadmin'); // Redirige al panel
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Login SuperAdmin</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br/>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Contraseña:</label><br/>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}
