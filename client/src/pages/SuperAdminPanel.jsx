// client/src/pages/SuperAdminPanel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usersApi from "../services/usersApi";
import "../styles/SuperAdminPanel.css";
import "../styles/ViewUsers.css";


export default function SuperAdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterRole, setFilterRole] = useState("");

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/superadmin/login");
  };

  const handleVer = () => {
    fetchUsers();
  };

  const toggleFilter = () => setShowFilter(!showFilter);

  //Busqueda y filtrado:
  const displayedUsers = users
    .filter((u) => {
      
      if (filterRole && u.role !== filterRole) return false;
      return true;
    })
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
      <aside className="sap-sidebar">
        <ul>
          <li onClick={handleVer}>
            <img src="/VER.png" alt="Ver" />
            <span>Ver</span>
          </li>
          <li onClick={() => navigate("/superadmin/createnew")}>
            <img src="/crear.png" alt="Crear" />
            <span>Crear</span>
          </li>
          <li>
            <img src="/boton-editar.png" alt="Editar" />
            <span>Editar</span>
          </li>
          <li>
            <img src="/eliminar.png" alt="Eliminar" />
            <span>Eliminar</span>
          </li>
          <li>
            <img src="/copias-de-seguridad.png" alt="Copia de seguridad" />
            <span>Copia de seguridad</span>
          </li>
          <li onClick={handleLogout}>
            <img src="/cerrar-sesion.png" alt="Cerrar sesión" />
            <span>Cerrar sesión</span>
          </li>
        </ul>
      </aside>

      <main className="sap-main">
        <header className="sap-header">
          <div className="sap-search">
            <input
              type="text"
              placeholder="Buscar por nombre, ID, cédula o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <img src="/lupa.png" alt="Buscar" className="sap-icon" />
            <img
              src="/filtrar.png"
              alt="Filtros"
              className="sap-icon"
              onClick={toggleFilter}
            />
          </div>
          {showFilter && (
            <div className="sap-filter-dropdown">
              <p>Filtrar por rol:</p>
              <div>
                <input
                  type="radio"
                  id="none"
                  name="filterRole"
                  value=""
                  checked={filterRole === ""}
                  onChange={() => setFilterRole("")}
                />
                <label htmlFor="none">Ninguno</label>
              </div>
              {Object.entries(roleMap).map(([key, label]) => (
                <div key={key}>
                  <input
                    type="radio"
                    id={key}
                    name="filterRole"
                    value={key}
                    checked={filterRole === key}
                    onChange={(e) => setFilterRole(e.target.value)}
                  />
                  <label htmlFor={key}>{label}</label>
                </div>
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
                      <h3>{u.name}</h3>
                      <p>Rol: {roleMap[u.role]}</p>
                      <p>ID: {u.id_user}</p>
                    </div>
                    <div className="flip-box-back">
                      <div className="vu-back-buttons">
                        <img
                          src="/boton-editar.png"
                          alt="Editar"
                          title="Editar"
                        />
                        <img
                          src="/VER.png"
                          alt="Más detalles"
                          title="Más detalles"
                        />
                      </div>
                      <h3>{u.name}</h3>
                      <p>Identificación: {u.id_card}</p>
                      <p>Email: {u.email}</p>
                      <p>Contraseña: {"*".repeat(8)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
