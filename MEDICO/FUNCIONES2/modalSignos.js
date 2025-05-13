document.addEventListener('DOMContentLoaded', () => {
  const modalElement = document.getElementById('authModal');
  const modalInstance = new bootstrap.Modal(modalElement); // Para cerrar manualmente
  const btnCerrar = document.getElementById('btnCerrarSignos');
  const accordion = document.getElementById('accordionAlt');

  // Cerrar el modal solo con el botón "Cerrar"
  btnCerrar.addEventListener('click', () => {
    limpiarSignosVitales();
    modalInstance.hide(); // Cierra el modal manualmente
  });

  // Limpiar también si se cierra con la X
  modalElement.addEventListener('hidden.bs.modal', () => {
    limpiarSignosVitales();
  });

  function limpiarSignosVitales() {
    accordion.innerHTML = '';
  }
  // Resto del código (btnBuscar, fetch, etc...) aquí
});
