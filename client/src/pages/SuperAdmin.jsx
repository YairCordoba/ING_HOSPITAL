import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdmin() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const exp = parseInt(localStorage.getItem('token_exp'), 10);
    if (!token || Date.now() > exp) {
      //Si no hay token, borramos y redirigimos al login
      localStorage.clear();
      navigate('/superadmin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/superadmin/login');
  };

  const name = localStorage.getItem('admin_name') || '';

  return (
    <div style={{ padding: 20 }}>
      <h1>Bienvenido, {name} (SuperAdmin)</h1>
      <button onClick={handleLogout}>Cerrar Sesión</button>
      {/* Aquí irán los botones */}
    </div>
  );
}
