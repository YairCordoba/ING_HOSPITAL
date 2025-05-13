document.addEventListener('DOMContentLoaded', () => {
  const fechaInput = document.getElementById('fecha');

  if (fechaInput) {
    const today = new Date();

    // Formato YYYY-MM-DD
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Establece la fecha actual
    fechaInput.value = todayStr;

    // Restringe selección solo a hoy
    fechaInput.min = todayStr;
    fechaInput.max = todayStr;
  }
});
