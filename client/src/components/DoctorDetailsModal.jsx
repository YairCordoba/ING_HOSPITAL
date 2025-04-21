// src/components/DoctorDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import superadminApi from '../services/superadminApi';
import '../styles/DoctorDetailsModal.css'; 

export default function DoctorDetailsModal({ doctorId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        
        const { data } = await superadminApi.get(`/doctors/${doctorId}`);
        setData(data);
        console.log(data)
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los detalles');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [doctorId]);

  if (!doctorId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <span className="modal-close" onClick={onClose}>&times;</span>
        {loading ? (
          <p>Cargando detalles...</p>
        ) : error ? (
          <p className="modal-error">{error}</p>
        ) : (
          <>
            <div className="md-header">
              <h2>
                ID: {data.doctor.id} &nbsp;–&nbsp;
                Revisando detalles de Médico: "{data.doctor.name}"
              </h2>
            </div>
            <div className="md-body">
              <div className="md-image">
                <img src="/doctor.png" alt="Doctor" />
              </div>
              <div className="md-fields">
                <label>Email:</label>
                <input type="text" value={data.doctor.email} readOnly />

                <label>Contraseña:</label>
                <input type="text" value="••••••••" readOnly />

                <label>Especialización:</label>
                <input type="text" value={data.doctor.specialization} readOnly />

                <label>Teléfono:</label>
                <input type="text" value={data.doctor.phone} readOnly />
              </div>
            </div>
            <div className="md-footer">
              <h3>Pacientes a cargo</h3>
              <ul className="md-patient-list">
                {data.patients.length
                  ? data.patients.map(p => (
                      <li key={p.id}>
                        <img src="/cuenta.png" alt="Paciente" />
                        {p.name} / {p.id_card}
                      </li>
                    ))
                  : <li>(No hay pacientes asignados)</li>
                }
              </ul>
              <button className="md-ok" onClick={onClose}>OK</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
