import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdmin from './pages/SuperAdminPanel';
import CreateNewUser from './pages/CreateNewUser';
import EditUser from './pages/EditUser';

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



         {/*Ruta para crear un nuevo usuario, solo accesible desde el panel de SuperAdmin*/}
        <Route path="/superadmin/createnew" element={<CreateNewUser />} />
        <Route path="/superadmin/editUser/:idUser/:role" element={<EditUser/>} />
        
        {/*Cualquier otra ruta no definida redirige a /*/}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
