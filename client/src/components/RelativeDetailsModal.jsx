// src/components/RelativeDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import superadminApi from '../services/superadminApi';
import '../styles/DoctorDetailsModal.css'; 

export default function RelativeDetailsModal({ relativeId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const { data } = await superadminApi.get(`/relatives/${relativeId}`);
        setData(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los detalles');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [relativeId]);

  if (!relativeId) return null;

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
              <h2>ID: {data.relative.id} – Detalles del Familiar: "{data.relative.name}"</h2>
            </div>
            <div className="md-body">
              <div className="md-image">
                <img src="/familiar.png" alt="Familiar" />
              </div>
              <div className="md-fields">
                <label>Email:</label>
                <input type="text" value={data.relative.email} readOnly />

                <label>Teléfono:</label>
                <input type="text" value={data.relative.phone} readOnly />

                <label>Dirección:</label>
                <input type="text" value={data.relative.address} readOnly />

                <label>Identificación:</label>
                <input type="text" value={data.relative.id_card} readOnly />
              </div>
            </div>
            <div className="md-footer">
              <h3>Paciente a cargo</h3>
              {data.patient ? (
                <ul className="md-patient-list">
                  <li>
                    <img src="/cuenta.png" alt="Paciente" />
                    {data.patient.name} / {data.patient.id_card}
                  </li>
                </ul>
              ) : (
                <p>(No tiene paciente asignado)</p>
              )}
              <button className="md-ok" onClick={onClose}>OK</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
