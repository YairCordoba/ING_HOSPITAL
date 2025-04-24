import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorForm from '../components/DoctorForm';
import PatientForm from '../components/PatientForm';
import RelativeForm from '../components/RelativeForm';
import AdminForm from '../components/AdminForm';
import superadminApi from '../services/superadminApi';
import '../styles/CreateNewUser.css';

export default function CreateNewUser() {
  const navigate = useNavigate();
  const [selection, setSelection] = useState('');
  const [allowCreateAdmin, setAllowCreateAdmin] = useState(false);

  const validateAdminCreation = async () => {
    setAllowCreateAdmin(false);
    try {
      const response = await superadminApi.get('/admins');
     
      if (response.data) {
        if (response.data.admins < 5) {
          setAllowCreateAdmin(true);
          setSelection('admin');
        } else {
          alert('Se ha alcanzado el número máximo permitido de administradores.');
          setSelection('');
        }
        
      } else {
        alert('Error al consultar la cantidad de administradores.');
        setSelection('');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  }

  return (
    <div className="cnu-container">
      <aside className="sap-sidebar">
        
        <ul>
        <li onClick={() => navigate('/superadmin')}><img src="/Inicio.png" alt="Inicio" /><span>Inicio</span></li>
          <li><img src="/crear.png" alt="Crear" /><span>Crear</span></li>
          
        </ul>
      </aside>

      <main className="cnu-main">
        <header className="cnu-header">
          <h2>Seleccione el tipo de usuario que desea crear</h2>
          <div className="cnu-buttons">
            <button onClick={() => setSelection('patient')}>+ Crear Paciente</button>
            <button onClick={() => setSelection('doctor')}>+ Crear Doctor</button>
            <button onClick={() => setSelection('relative')}>+ Crear Familiar</button>
            <button onClick={() => validateAdminCreation()}>+ Crear Administrador</button>
          </div>
        </header>

        <section className="cnu-form-section">
          {!selection && (
            <div className="cnu-placeholder">
              <p>
                [AQUÍ SE DESPLEGARÁ EL FORMULARIO SELECCIONADO] <br/>
                Por favor seleccione el tipo de formulario para continuar.
              </p>
            </div>
          )}
          {selection === 'doctor' && <DoctorForm />}
          {selection === 'patient' && <PatientForm />}
          {selection === 'relative' && <RelativeForm />}
          {selection === 'admin' && allowCreateAdmin && <AdminForm />}
        </section>
      </main>
    </div>
);
}
