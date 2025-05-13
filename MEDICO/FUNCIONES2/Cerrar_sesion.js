// Seleccionamos el botón de cerrar sesión
const logoutButton = document.getElementById('logout-btn');

// Agregar un event listener al botón de cerrar sesión
logoutButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevenir la acción por defecto (en este caso, que sea un enlace)

    // Eliminar el token del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Si también estás almacenando el objeto del usuario
    // Redirigir al usuario a la página de login (puedes cambiar la URL a la que redirige)
    window.location.replace('../login.html'); // O la URL de tu página de inicio de sesión
});

// Obtener los datos del usuario desde localStorage
const userInfo = JSON.parse(localStorage.getItem('user'));
if (userInfo) {
  document.getElementById('user-name').textContent = userInfo.name;
  document.getElementById('user-email').textContent = userInfo.email;
  document.getElementById('user-role').textContent = userInfo.role;
} else {
  // Si no hay sesión, cerrar y redirigir
  localStorage.clear();
  window.location.replace('../login.html');

}

// Evento para el botón de cerrar sesión
if (logoutButton) {
  logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.clear();
    window.location.replace('../login.html'); // replace evita volver con "Atrás"
  });
}

// Bloquear el botón "Atrás" del navegador
history.pushState(null, null, location.href);
window.onpopstate = function () {
  localStorage.clear(); // Cerrar sesión si intenta volver
  window.location.replace('../login.html'); // Cambiar la URL a la página de inicio de sesión
};
