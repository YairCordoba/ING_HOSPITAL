document.addEventListener('DOMContentLoaded', () => {
  const btnBuscar = document.getElementById('btnBuscar');
  const btnCerrar = document.getElementById('btnCerrarSignos');
  const accordion = document.getElementById('accordionSignos');
  const idInput = document.getElementById('id_paciente');
  const modal = document.getElementById('miModal');
  
  btnBuscar.addEventListener('click', function () {
    const idPaciente = idInput.value.trim();

    if (!idPaciente) {
      alert('Por favor ingrese un ID del paciente');
      return;
    }

    fetch(`http://localhost:7000/api/signos-vitales?id_patient=${idPaciente}`)
      .then(response => response.json())
      .then(data => {
        if (!data.success) {
          alert(data.error || 'No se encontraron signos vitales');
          return;
        }

        accordion.innerHTML = '';

        data.vitalSigns.forEach((vital, index) => {
          const item = document.createElement('div');
          item.className = 'accordion-item border-0 rounded-3 shadow-sm mb-3';
          item.innerHTML = `
            <h3 class="accordion-header" id="headingSigno${index}">
              <button class="accordion-button shadow-none rounded-3 ${index === 0 ? '' : 'collapsed'}" type="button"
                data-bs-toggle="collapse" data-bs-target="#collapseSigno${index}" aria-expanded="${index === 0 ? 'true' : 'false'}"
                aria-controls="collapseSigno${index}">
                Signos Vitales - ${formatDate(vital.measurement_date)} ${vital.measurement_time}
              </button>
            </h3>
            <div id="collapseSigno${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}"
              aria-labelledby="headingSigno${index}" data-bs-parent="#accordionSignos">
              <div class="accordion-body pt-0">
                <p><strong>Frecuencia Cardíaca:</strong> ${vital.heart_rate} bpm</p>
                <p><strong>Temperatura:</strong> ${vital.temperature} °C</p>
                <p><strong>Presión Arterial:</strong> ${vital.blood_pressure}</p>
                <p><strong>Frecuencia Respiratoria:</strong> ${vital.respiratory_rate}</p>
                <p><strong>Peso:</strong> ${vital.weight} kg</p>
                <p><strong>Observaciones:</strong> ${vital.observations}</p>
              </div>
            </div>
          `;
          accordion.appendChild(item);
        });
      })
      .catch(error => {
        console.error('Error al obtener signos vitales:', error);
        alert('Hubo un error al obtener los datos');
      });
  });

  btnCerrar.addEventListener('click', () => {
    limpiarSignosVitales();
    const tabTrigger = new bootstrap.Tab(document.querySelector('a[href="#signin"]'));
    tabTrigger.show();
  });

  document.querySelectorAll('a[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', function (event) {
      const previousTab = event.relatedTarget?.getAttribute('href');
      if (previousTab === '#signup') {
        limpiarSignosVitales();
      }
    });
  });

  modal.addEventListener('hidden.bs.modal', () => {
    limpiarSignosVitales();
  });

  function limpiarSignosVitales() {
    accordion.innerHTML = '';
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }
});