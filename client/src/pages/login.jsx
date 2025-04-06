import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Login Page</h1>
      <p>¿Eres SuperAdmin? <Link to="/superadmin/login">Inicia sesión aquí</Link></p>
    </div>
  );
}
