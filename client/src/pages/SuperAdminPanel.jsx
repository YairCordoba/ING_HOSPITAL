// client/src/pages/SuperAdminPanel.jsx
import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usersApi from "../services/usersApi";
import superadminApi from "../services/superadminApi";
import Sidebar from "../components/Sidebar";
import "../styles/SuperAdminPanel.css";
import "../styles/ViewUsers.css";
import DoctorDetailsModal from "../components/DoctorDetailsModal";
import PatientDetailsModal from "../components/PatientDetailsModal";
import RelativeDetailsModal from "../components/RelativeDetailsModal";
import AdminDetailsModal from "../components/AdminDetailsModal";
import DeleteUserModal from '../components/DeleteUserModal';

export default function SuperAdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterRole, setFilterRole] = useState("");
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [backupError, setBackupError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalDoctorId, setModalDoctorId] = useState(null);
  const [modalPatientId, setModalPatientId] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [modalRelativeId, setModalRelativeId] = useState(null);
  const [showRelativeModal, setShowRelativeModal] = useState(false);
  const [modalAdminId, setModalAdminId] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const [modalDeleteUserId, setModalDeleteUserId] = useState(null);
  const [modalDeleteRolId, setModalDeleteRolId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const roleMap = {
    Patient: "Paciente",
    Doctor: "Doctor",
    Admin: "Administrador",
    Relative: "Familiar",
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.get("/");
      setUsers(data);
    } catch (err) {
      console.error("Error al traer usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const exp = parseInt(localStorage.getItem("token_exp"), 10);
    if (!token || Date.now() > exp) {
      localStorage.clear();
      navigate("/superadmin/login");
      return;
    }
    fetchUsers();
  }, [navigate]);

  const handleVer = () => fetchUsers();
  const handleCrear = () => navigate("/superadmin/createnew");
  const handleLogout = () => {
    localStorage.clear();
    navigate("/superadmin/login");
  };

  const handleBackup = async () => {
    setBackupError("");
    setLoadingBackup(true);
    try {
      const response = await superadminApi.get("/backup", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "backup.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setBackupError("Hubo un problema generando la copia de seguridad.");
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleEditUser = (id, roleId) => {
    if (roleId === "Doctor" && id === 13) {
      alert("❌ No se puede editar el doctor por defecto - SIN ASIGNAR");
      return;
    }
    navigate(`/superadmin/editUser/${id}/${roleId}`);
  };


  const toggleFilter = () => setShowFilter(!showFilter);

  const displayedUsers = users
    .filter((u) => (filterRole ? u.role === filterRole : true))
    .filter((u) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.id_card.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.id_user.toString().includes(term)
      );
    });

  return (
    <div className="sap-container">
      {/** Aquí pasamos todas las acciones al Sidebar */}
      <Sidebar
        onVer={handleVer}
        onCrear={handleCrear}
        onBackup={handleBackup}
        onLogout={handleLogout}
      />
      <main className="sap-main">
        <header className="sap-header">
          <div className="sap-search">
            <input
              type="text"
              placeholder="Buscar por nombre, ID, cédula o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <img src="/lupa.png" alt="Buscar" className="sap-icon lupa" />
            <img
              src="/filtrar.png"
              alt="Filtros"
              className="sap-icon filtro"
              onClick={toggleFilter}
            />
          </div>
          {showFilter && (
            <div className="sap-filter-dropdown">
              <p>Filtrar por rol:</p>
              <label>
                <input
                  type="radio"
                  name="filterRole"
                  checked={!filterRole}
                  onChange={() => setFilterRole("")}
                />{" "}
                Ninguno
              </label>
              {Object.entries(roleMap).map(([key, label]) => (
                <label key={key}>
                  <input
                    type="radio"
                    name="filterRole"
                    value={key}
                    checked={filterRole === key}
                    onChange={() => setFilterRole(key)}
                  />{" "}
                  {label}
                </label>
              ))}
              <button onClick={() => setShowFilter(false)}>Aplicar</button>
            </div>
          )}
        </header>
        <section className="sap-table-section">
          {loading ? (
            <p>Cargando usuarios...</p>
          ) : displayedUsers.length === 0 ? (
            <p>Aún no hay registros en la Base de Datos</p>
          ) : (
            <div className="vu-container">
              {displayedUsers.map((u) => (
                <div className="flip-box" key={u.id_user}>
                  <div className="flip-box-inner">
                    <div className="flip-box-front">
                      <img
                        src="/cuenta.png"
                        alt="Cuenta"
                        className="vu-avatar"
                      />
                      <h3 className="vu-name" title={u.name}>
                        {u.name}
                      </h3>
                      <p className="vu-role">Rol: {roleMap[u.role]}</p>
                      <p className="vu-id">ID: {u.id_user}</p>
                    </div>
                    <div className="flip-box-back">
                      <div className="vu-back-buttons">
                         <img
                          src="/eliminar.png"
                          alt="Eliminar"
                          title="Eliminar"
                          onClick={() => { setModalDeleteUserId(u.role_specific_id);
                            setModalDeleteRolId(u.role);
                            setShowDeleteModal(true);}}
                        />
                        <img
                          src="/boton-editar.png"
                          alt="Editar"
                          title="Editar"
                          onClick={() => handleEditUser(u.role_specific_id, u.role)}
                        />
                        <img
                          src="/VER.png"
                          alt="Más detalles"
                          title="Más detalles"
                          onClick={() => {
                            if (u.role === 'Patient') {
                              setModalPatientId(u.role_specific_id);
                              setShowPatientModal(true);
                            } else if (u.role === 'Doctor') {
                              setModalDoctorId(u.role_specific_id);
                              setShowModal(true);
                            } else if (u.role === 'Relative') {
                              setModalRelativeId(u.role_specific_id);
                              setShowRelativeModal(true);
                            } else if (u.role === 'Admin') {
                              setModalAdminId(u.role_specific_id);
                              setShowAdminModal(true);
                            } else {
                              alert('Detalles no disponibles para este rol');
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                      <h3 className="vu-name-back" title={u.name}>
                        {u.name}
                      </h3>
                      <p className="vu-card">Identificación: {u.id_card}</p>
                      <p className="vu-email">Email: {u.email}</p>
                      <p className="vu-pass">Contraseña: {"*".repeat(8)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
      </main>
      {/** Overlay de carga */}
      {loadingBackup && (
        <div className="sap-loading-overlay">
          <img src="/loading.gif" alt="Generando copia..." />
        </div>
      )}
      {/** Mensaje de error */}
      {backupError && <div className="sap-error">{backupError}</div>}

      {showModal && (
        <DoctorDetailsModal
          doctorId={modalDoctorId}
          onClose={() => setShowModal(false)}
        />
      )}
      {showPatientModal && (
        <PatientDetailsModal
          patientId={modalPatientId}
          onClose={() => setShowPatientModal(false)}
        />
      )}
      {showRelativeModal && (
        <RelativeDetailsModal
          relativeId={modalRelativeId}
          onClose={() => setShowRelativeModal(false)}
        />
      )}
      {showAdminModal && (
        <AdminDetailsModal
          adminId={modalAdminId}
          onClose={() => setShowAdminModal(false)}
        />
      )}
       {showDeleteModal && (
        <DeleteUserModal
          userId={modalDeleteUserId}
          rolUser={modalDeleteRolId}
          onClose={() => setShowDeleteModal(false)}
          fetchUsers={fetchUsers}
        />
      )}
    </div>
  );
}
