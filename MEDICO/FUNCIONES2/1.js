document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('reportForm');

    if (!reportForm) {
      console.error('Formulario no encontrado.');
      return;
    }

    // Simular carga de ID desde localStorage o sesión
    document.getElementById('idPaciente').value = localStorage.getItem('idPaciente') || '1';

    reportForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!reportForm.checkValidity()) {
        reportForm.classList.add('was-validated');
        return;
      }

      const patient_id = document.getElementById('idPaciente').value;
      const report_date = document.getElementById('fecha').value;
      const care_suggestions = document.getElementById('sugerencias').value;
      const follow_up_reason = document.getElementById('motivo').value;
      const doctor_id = document.getElementById('idMedico').value;

      try {
        const response = await fetch('http://localhost:7000/reports/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id,
            report_date,
            care_suggestions,
            follow_up_reason,
            doctor_id
          })
        });

        const data = await response.json();

        if (response.ok) {
          alert('✅ Reporte guardado con éxito');
          reportForm.reset();
          reportForm.classList.remove('was-validated');
        } else {
          alert(`❌ Error: ${data.message}`);
        }

      } catch (error) {
        console.error('Error al enviar el formulario:', error);
        alert('❌ Error de red. Intenta más tarde.');
      }
    });
  });