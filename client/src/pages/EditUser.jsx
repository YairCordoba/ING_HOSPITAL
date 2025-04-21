import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from "react";
import DoctorForm from '../components/DoctorForm';
import PatientForm from '../components/PatientForm';
import RelativeForm from '../components/RelativeForm';
import '../styles/CreateNewUser.css';

export default function EditUser() {
  let { idUser, role } = useParams();
  const navigate = useNavigate();

   useEffect(() => {
      if (!idUser || !role) return;
    }, [idUser, role]);

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
          {role === 'Patient' && <PatientForm idPatient={idUser}/>}
          {role === 'Relative' && <RelativeForm idRelative={idUser}/>}
          
        </section>
      </main>
    </div>
);
}
