// recuperar.js
let usuarioCedula = null;
let codigoVerificado = false;

function mostrarPaso(id) {
  document.getElementById("step1").classList.add("hidden");
  document.getElementById("step2").classList.add("hidden");
  document.getElementById("step3").classList.add("hidden");
  document.getElementById(id).classList.remove("hidden");
}

function mostrarMensaje(mensaje, esError = false) {
  const mensajeEl = document.getElementById("message");
  const errorEl = document.getElementById("error");
  mensajeEl.textContent = "";
  errorEl.textContent = "";

  if (esError) {
    errorEl.textContent = mensaje;
  } else {
    mensajeEl.textContent = mensaje;
  }
}

async function enviarCodigo() {
  const cedula = document.getElementById("cedula").value.trim();
  if (!cedula) {
    mostrarMensaje("Por favor ingresa tu número de documento.", true);
    return;
  }

  try {
    const res = await fetch("http://localhost:7000/enviar-codigo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cedula })
    });

    const data = await res.json();

    if (data.success) {
      usuarioCedula = cedula;
      mostrarPaso("step2");
      mostrarMensaje("Se envió un código a tu correo.");
    } else {
      mostrarMensaje(data.message, true);
    }
  } catch (err) {
    mostrarMensaje("Error de conexión con el servidor.", true);
    console.error(err);
  }
}

async function verificarCodigo() {
  const codigo = document.getElementById("codigo").value.trim();

  if (!codigo) {
    mostrarMensaje("Por favor ingresa el código.", true);
    return;
  }

  try {
    const res = await fetch("http://localhost:7000/verificar-codigo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cedula: usuarioCedula, codigo })
    });

    const data = await res.json();

    if (data.success) {
      codigoVerificado = true;
      mostrarPaso("step3");
      mostrarMensaje("Código verificado correctamente.");
    } else {
      mostrarMensaje(data.message, true);
    }
  } catch (err) {
    mostrarMensaje("Error de conexión.", true);
    console.error(err);
  }
}

function esContrasenaValida(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

async function actualizarContrasena() {
  const nuevaClave = document.getElementById("nuevaClave").value;

  if (!esContrasenaValida(nuevaClave)) {
    mostrarMensaje(
      "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
      true
    );
    return;
  }

  if (!codigoVerificado) {
    mostrarMensaje("Debes verificar el código primero.", true);
    return;
  }

  try {
    const res = await fetch("http://localhost:7000/actualizar-contrasena", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cedula: usuarioCedula,
        
        nuevaClave
      })
    });

    const data = await res.json();

    if (data.success) {
      mostrarMensaje("Contraseña actualizada con éxito.");
      // Espera 2 segundos y redirige al login
      setTimeout(() => {
        window.location.href = "../login.html";
      }, 2000);
    } else {
      mostrarMensaje(data.message, true);
    }
  } catch (err) {
    mostrarMensaje("No se pudo actualizar la contraseña.", true);
    console.error(err);
  }
}
