function abrirMapa() {
    const direccion = document.getElementById('direccionPaciente').textContent;
    if (!direccion || direccion === 'No registrada') {
      alert('Dirección no disponible para mostrar en el mapa.');
      return;
    }

    // Abrir modal
    const mapaModal = new bootstrap.Modal(document.getElementById('modalMapa'));
    mapaModal.show();

    // Evitar duplicación de mapa si ya existe
    if (window.mapaInstancia) {
      window.mapaInstancia.remove();
    }

    // Geolocalizar dirección
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          // Inicializar mapa
          window.mapaInstancia = L.map('mapaPaciente').setView([lat, lon], 16);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(window.mapaInstancia);

          L.marker([lat, lon]).addTo(window.mapaInstancia)
            .bindPopup(`Dirección: ${direccion}`)
            .openPopup();
        } else {
          document.getElementById('mapaPaciente').innerHTML = '<p>No se encontró la ubicación.</p>';
        }
      })
      .catch(err => {
        console.error(err);
        document.getElementById('mapaPaciente').innerHTML = '<p>Error al cargar el mapa.</p>';
      });
  }