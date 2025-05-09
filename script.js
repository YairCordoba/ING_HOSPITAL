const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');


loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id_card = document.getElementById('id_card').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:7000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_card, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            switch (data.user.role) {
                case 'Doctor': window.location.href = 'MEDICO/I_Medico.html'; break;
                case 'Patient': window.location.href = 'PACIENTE/I_Paciente.html'; break;
                case 'Relative': window.location.href = 'Familiar/I_Familiar.html'; break;
                default:
                    errorMessage.textContent = 'Rol de usuario no reconocido o sin acceso.';
            }
        } else {
            errorMessage.textContent = data.message;
        }
    } catch (error) {
        errorMessage.textContent = 'Error de red. Intenta de nuevo.';
        console.error(error);
    }
});
