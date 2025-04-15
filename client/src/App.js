import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdmin from './pages/SuperAdminPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*Pagina de bienvenida o login general*/}
        <Route path="/" element={<Login />} />

        {/*Login exclusivo de SuperAdmin*/}
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />

        {/*Panel de SuperAdmin*/}
        <Route path="/superadmin" element={<SuperAdmin />} />

        {/*Cualquier otra ruta no definida redirige a /*/}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
