function verPaciente(p) {
    document.getElementById('detallePaciente').classList.remove('d-none');
    document.getElementById('nombrePaciente').textContent = p.name;
    document.getElementById('emailPaciente').textContent = p.email || 'No registrado';
    document.getElementById('telefonoPaciente').textContent = p.phone || 'No registrado';
    document.getElementById('Cedula').textContent = p.id_card || 'No registrado';
    document.getElementById('ID').textContent = p.id_patient || 'No registrado';
    document.getElementById('fechaPaciente').textContent = p.birth_date ? formatDate(p.birth_date) : 'No registrada';
    document.getElementById('direccionPaciente').textContent = p.address || 'No registrada';

    // Para el formulario de actualización
    document.getElementById('idPaciente').value = p.id_patient || '';
    document.getElementById('id_paciente').value = p.id_patient || '';
    document.getElementById('patient_id').value = p.id_patient || '';
    document.getElementById('Telefono1').value = p.phone || '';
    document.getElementById('direccion').value = p.address || '';
    document.getElementById('estado_civil').value = p.marital_status || '';
    document.getElementById('ocupacion').value = p.occupation || '';

    obtenerGeolocalizacion(p.address);
  }

  function cerrarDetalle() {
    document.getElementById('detallePaciente').classList.add('d-none');
    document.getElementById('mapaPaciente').innerHTML = ''; // limpia el mapa
  }

  function obtenerGeolocalizacion(direccion) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          const map = L.map('mapaPaciente').setView([lat, lon], 16);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>Dirección:</b><br>${direccion}`)
            .openPopup();
        } else {
          document.getElementById('mapaPaciente').innerText = 'Ubicación no encontrada.';
        }
      })
      .catch(error => {
        console.error('Error al obtener geolocalización:', error);
        document.getElementById('mapaPaciente').innerText = 'Error al obtener la ubicación.';
      });
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO'); // o cambia según tu país
  }