function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function createAccordionItem(report, index) {
  return `
    <div class="accordion-item border-0 rounded-3 shadow-sm mb-3">
      <h3 class="accordion-header" id="headingReporte${index}">
        <button class="accordion-button shadow-none rounded-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseReporte${index}" aria-expanded="true" aria-controls="collapseReporte${index}">
          Reporte #${report.report_id} - Fecha: ${report.report_date}
        </button>
      </h3>
      <div class="accordion-collapse collapse" id="collapseReporte${index}" aria-labelledby="headingReporte${index}" data-bs-parent="#accordionReportes">
        <div class="accordion-body pt-0">
          <strong>Sugerencias de cuidado:</strong> ${report.care_suggestions} <br>
          <strong>Razón de seguimiento:</strong> ${report.follow_up_reason}
        </div>
      </div>
    </div>
  `;
}

async function loadReports() {
  const patientId = document.getElementById("patient_id").value;

  if (!patientId) {
    alert("Por favor, ingrese un ID de paciente.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:7000/api/reports?patient_id=${patientId}`);

    if (!response.ok) {
      const data = await response.json();
      alert(data.error || data.message || "Hubo un error en la solicitud.");
      return;
    }

    const reports = await response.json();

    if (reports.length === 0) {
      alert("No se encontraron reportes para este paciente.");
      return;
    }

    const accordion = document.getElementById('accordionReportes');
    accordion.innerHTML = '';

    reports.forEach((report, index) => {
      accordion.innerHTML += createAccordionItem(report, index);
    });

  } catch (error) {
    console.error("Hubo un error al obtener los reportes:", error);
    alert("Hubo un error al obtener los reportes.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const patientIdFromUrl = getQueryParam("patient_id");
  if (patientIdFromUrl) {
    document.getElementById("patient_id").value = patientIdFromUrl;
    loadReports();
  }

  document.getElementById("btnBuscarReportes").addEventListener("click", loadReports);

  document.getElementById("btnCerrarReportes").addEventListener("click", () => {
    document.getElementById("accordionReportes").innerHTML = '';
    document.getElementById("patient_id").value = '';
  });
});
