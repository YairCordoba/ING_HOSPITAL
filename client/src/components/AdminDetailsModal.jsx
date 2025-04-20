// src/components/AdminDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import superadminApi from '../services/superadminApi';
import '../styles/DoctorDetailsModal.css';

export default function AdminDetailsModal({ adminId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const { data } = await superadminApi.get(`/admins/${adminId}`);
        setData(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los detalles del administrador');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [adminId]);

  if (!adminId) return null;

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
              <h2>ID: {data.admin.id} – Detalles del Administrador</h2>
            </div>
            <div className="md-body">
              <div className="md-image">
                <img src="/admin.png" alt="Administrador" />
              </div>
              <div className="md-fields">
                <label>Nombre:</label>
                <input type="text" value={data.admin.name} readOnly />

                <label>Email:</label>
                <input type="text" value={data.admin.email} readOnly />

                <label>Identificación:</label>
                <input type="text" value={data.admin.id_card} readOnly />
              </div>
            </div>
            <div className="md-footer">
              <button className="md-ok" onClick={onClose}>OK</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
