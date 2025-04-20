import React from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorForm from '../components/DoctorForm';
import PatientForm from '../components/PatientForm';
import RelativeForm from '../components/RelativeForm';
import '../styles/CreateNewUser.css';
import { useParams } from "react-router-dom";


export default function EditUser() {
  let { idUser, role } = useParams();
  const navigate = useNavigate();

  return (
    <div className="cnu-container">
      <aside className="sap-sidebar">
        
        <ul>
          <li onClick={() => navigate('/superadmin')}><img src="/VER.png" alt="Ver" /><span>Ver</span></li>
          
        </ul>
      </aside>

      <main className="cnu-main">
    
        <section className="cnu-form-section">
        
          {role === 'Doctor' && <DoctorForm idDoctor={idUser}/>}
          {role === 'Patient' && <PatientForm idPaciente={idUser}/>}
          {role === 'Relative' && <RelativeForm idFamiliar={idUser}/>}
          
        </section>
      </main>
    </div>
);
}
