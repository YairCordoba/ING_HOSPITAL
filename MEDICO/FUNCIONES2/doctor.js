function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = ("0" + (d.getMonth() + 1)).slice(-2);  // Mes con dos dígitos
  const day = ("0" + d.getDate()).slice(-2);  // Día con dos dígitos
  return `${year}-${month}-${day}`;  // Formato 'YYYY-MM-DD'
}

const user = JSON.parse(localStorage.getItem('user'));

if (!user || user.role !== 'Doctor') {
  alert('Acceso no autorizado.');
  window.location.href = '../login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  // Mostrar datos del usuario en la interfaz
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('user-role').textContent = user.role;
  document.getElementById('user-card').textContent = user.id_card;

  const idDoctor = user.additional_info?.id_doctor || 'No disponible';
  document.getElementById('idMedico').value = idDoctor;

  // Buscar pacientes automáticamente
  await buscarPacientes(user.id_card);
});

async function buscarPacientes(cedula) {
  const lista = document.getElementById('listaPacientes');
  lista.innerHTML = '<li>Cargando pacientes...</li>';

  try {
    const respuesta = await fetch('http://localhost:7000/api/pacientes?cedula=' + encodeURIComponent(cedula));
    const data = await respuesta.json();
    lista.innerHTML = '';

    if (data.error || !data.pacientes.length) {
      lista.innerHTML = '<li class="text-danger">No se encontraron pacientes asignados</li>';
      return;
    }

    data.pacientes.forEach((p) => {
      const li = document.createElement('li');
      li.className = 'd-flex align-items-center justify-content-between mb-4';
      li.innerHTML = `
        <div class="d-flex align-items-start me-3">
          <div class="bg-secondary rounded-1 p-2">
            <i class="bx bx-user fs-xl text-primary d-block"></i>
          </div>
          <div class="ps-3">
            <div class="fw-medium text-nav mb-1">${p.name}  ${p.id_patient} ${p.id_card}
              <span class="badge bg-success shadow-success">ID ${p.id_patient}</span> 
              <span class="badge bg-danger shadow-danger">CC ${p.id_card}</span>
            </div>
            <span class="d-inline-block fs-sm text-muted border-end pe-2 me-2">${data.doctor}</span>
            <span class="badge bg-success shadow-success">Asignado</span>
          </div>
        </div>
        <button type="button" class="btn btn-outline-primary px-3 px-sm-4" onclick='verPaciente(${JSON.stringify(p)})'>
          <i class="bx bx-show fs-xl ms-sm-n1 me-sm-1"></i>
          <span class="d-none d-sm-inline">Ver</span>
        </button>
      `;
      lista.appendChild(li);
    });
  } catch (e) {
    console.error('Error al obtener pacientes:', e);
    lista.innerHTML = '<li class="text-danger">Error al conectar con el servidor</li>';
  }
}

function verPaciente(p) {
  document.getElementById('detallePaciente').classList.remove('d-none');
  document.getElementById('nombrePaciente').textContent = p.name;
  document.getElementById('emailPaciente').textContent = p.email || 'No registrado';
  document.getElementById('telefonoPaciente').textContent = p.phone || 'No registrado';
  document.getElementById('Cedula').textContent = p.id_card || 'No registrado';
  document.getElementById('Cedula1').textContent = p.id_card || 'No registrado';
  document.getElementById('ID').textContent = p.id_patient || 'No registrado';
  document.getElementById('ID1').textContent = p.id_patient || 'No registrado';
  document.getElementById('fechaPaciente').textContent = p.birth_date ? formatDate(p.birth_date) : 'No registrada';
  document.getElementById('direccionPaciente').textContent = p.address || 'No registrada';
  document.getElementById('idPaciente').value = p.id_patient || 'No registrado';
  document.getElementById('id_patient').value = p.id_patient || 'No registrado';
}

function cerrarDetalle() {
  document.getElementById('detallePaciente').classList.add('d-none');
}
