document.getElementById('cargarDatos').addEventListener('click', async () => {
    const token = localStorage.getItem('token'); // ⚠️ Asegúrate que guardaste el token en login

    if (!token) {
        alert('Por favor inicia sesión primero.');
        return;
    }

    try {
        const res = await fetch('http://localhost:7000/vital-signs', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const error = await res.json();
            alert('Error: ' + error.message);
            return;
        }

        const datos = await res.json();
        const tabla = document.getElementById('contenidoTabla');
        tabla.innerHTML = '';

        datos.forEach(signo => {
            const fila = `
                <tr>
                    <td>${new Date(signo.fecha).toLocaleDateString()}</td>
                    <td>${signo.temperatura} °C</td>
                    <td>${signo.presion}</td>
                    <td>${signo.frecuencia_cardiaca}</td>
                    <td>${signo.frecuencia_respiratoria}</td>
                </tr>
            `;
            tabla.innerHTML += fila;
        });

    } catch (err) {
        console.error('Error de red:', err);
        alert('No se pudo conectar con el servidor.');
    }
});
