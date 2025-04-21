// src/components/PatientDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import superadminApi from '../services/superadminApi';
import '../styles/PatientDetailsModal.css';

export default function PatientDetailsModal({ patientId, onClose }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    superadminApi.get(`/patients/${patientId}`)
      .then(({ data }) => setData(data))
      .catch(() => setError('Error cargando detalles'))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (!patientId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content patient-modal" onClick={e => e.stopPropagation()}>
        <span className="modal-close" onClick={onClose}>&times;</span>

        {loading || error ? (
          <div className="modal-body center">
            {loading 
              ? <p className="modal-loading">Cargando detalles...</p>
              : <p className="modal-error">{error}</p>
            }
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="pd-header">
              <div className="pd-header-left">
                ID: {data.patient.id} &mdash; REVISANDO TODOS LOS DETALLES DE:
              </div>
              <div className="pd-header-right">
                {data.patient.name} / {data.patient.id_card}
              </div>
            </div>

            {/* CUERPO PRINCIPAL (SCROLL) */}
            <div className="modal-body">

              {/* BLOQUE 1: Paciente (col 1) */}
              <section className="pd-section patient-section">
                <div className="ps-content">
                  <img src="/patient.png" alt="Paciente" className="pd-icon-large" />
                  <div className="pd-fields">
                    <label>Email:</label>
                    <input type="text" value={data.patient.email} readOnly/>
                    <label>Contraseña:</label>
                    <input type="text" value="••••••••" readOnly/>
                    <label>Tipo sangre:</label>
                    <input type="text" value={data.patient.blood_type || '-'} readOnly/>
                    <label>F. Nac.:</label>
                    <input
                      type="text"
                      value={
                        data.patient.birth_date
                          ? new Date(data.patient.birth_date).toLocaleDateString()
                          : '-'
                      }
                      readOnly
                    />
                    <label>Ocupación:</label>
                    <input type="text" value={data.patient.occupation || '-'} readOnly/>
                    <label>Estado civil:</label>
                    <input type="text" value={data.patient.marital_status || '-'} readOnly/>
                    <label>Teléfono:</label>
                    <input type="text" value={data.patient.phone || '-'} readOnly/>
                    <label>Dirección:</label>
                    <input type="text" value={data.patient.address || '-'} readOnly/>
                  </div>
                </div>
              </section>

              {/* BLOQUE 1: Familiares (col 2) */}
              {data.relatives.length > 0 && (
                <section className="pd-section relatives-section">
                  <h3>Familiar Encargado</h3>
                  <ul className="pd-list">
                    {data.relatives.map(r => (
                      <li key={r.id} className="rel-item">
                        <img src="/familiar.png" alt="" className="pd-icon-large" />
                        <span>{r.name} / {r.id_card}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* BLOQUE 2: Doctor (ancho completo) */}
              {data.doctor && (
                <section className="pd-section doctor-section">
                  <h3>Doctor Asignado</h3>
                  <img
                    src="/doctor.png"
                    alt="Doctor"
                    className="doctor-img"
                  />
                  <p>{data.doctor.name} / {data.doctor.specialization}</p>
                </section>
              )}

              {/* BLOQUE 3: Signos Vitales (ancho completo) */}
              {data.vitals.length > 0 && (
                <section className="pd-section vitals-section">
                  <h3>Signos Vitales del Paciente</h3>
                  <table className="pd-table">
                    <thead>
                      <tr>
                        <th>Fecha</th><th>Hora</th><th>FC</th>
                        <th>Temp</th><th>PA</th><th>FR</th><th>Peso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.vitals.map(v => (
                        <tr key={v.id}>
                          <td>{new Date(v.measurement_date).toLocaleDateString()}</td>
                          <td>{v.measurement_time}</td>
                          <td>{v.heart_rate}</td>
                          <td>{v.temperature}</td>
                          <td>{v.blood_pressure}</td>
                          <td>{v.respiratory_rate}</td>
                          <td>{v.weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <br/>
                  <label>Observaciones:</label>
                  <textarea
                    value={data.vitals[0].observations || ''}
                    readOnly
                  />
                </section>
              )}

              {/* BLOQUE 4: Citas (ancho completo) */}
              {data.appointments.length > 0 && (
                <section className="pd-section appointments-section">
                  <h3>Citas del Paciente</h3>
                  <table className="pd-table">
                    <thead>
                      <tr><th>ID</th><th>Fecha</th><th>Hora</th><th>Estatus</th></tr>
                    </thead>
                    <tbody>
                      {data.appointments.map(a => (
                        <tr key={a.id}>
                          <td>{a.id}</td>
                          <td>{new Date(a.appointment_date).toLocaleDateString()}</td>
                          <td>{a.appointment_time}</td>
                          <td>{a.status ? 'Activa' : 'Inactiva'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
            </div>

            {/* BOTÓN OK */}
            <button className="pd-ok" onClick={onClose}>OK</button>
          </>
        )}
      </div>
    </div>
  );
}
