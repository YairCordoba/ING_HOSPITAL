import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorForm from '../components/DoctorForm';
import PatientForm from '../components/PatientForm';
import RelativeForm from '../components/RelativeForm';
import '../styles/CreateNewUser.css';

export default function CreateNewUser() {
  const navigate = useNavigate();
  const [selection, setSelection] = useState('');

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
        </section>
      </main>
    </div>
);
}
