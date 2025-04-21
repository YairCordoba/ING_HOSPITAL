import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import superadminApi from '../services/superadminApi';
import '../styles/Sidebar.css';

export default function Sidebar({ onVer }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const openNav = () => setOpen(true);
  const closeNav = () => setOpen(false);

  const handleVer = () => {
    onVer();
    closeNav();
  };

  const handleCrear = () => {
    navigate('/superadmin/createnew');
    closeNav();
  };

  const handleBackup = async () => {
    closeNav();
    try {
      const response = await superadminApi.get('/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'backup.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando backup:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/superadmin/login');
    closeNav();
  };

  return (
    <>
      {/* Botón para abrir el sidenav */}
      <span className="open-nav-btn" onClick={openNav}>&#9776;</span>

      {/* El overlay sidenav */}
      <div id="mySidenav" className={`sidenav ${open ? 'sidenav-open' : ''}`}>
        <a href="#!" className="closebtn" onClick={closeNav}>&times;</a>
        <a href="#!" onClick={handleVer}>
          <img src="/VER.png" alt="Ver" /> Ver
        </a>
        <a href="#!" onClick={handleCrear}>
          <img src="/crear.png" alt="Crear" /> Crear
        </a>
        <a href="#!" onClick={handleBackup}>
          <img src="/copias-de-seguridad.png" alt="Backup" /> Copia de seguridad
        </a>
        <a href="#!" onClick={handleLogout}>
          <img src="/cerrar-sesion.png" alt="Logout" /> Cerrar sesión
        </a>
      </div>
    </>
  );
}
