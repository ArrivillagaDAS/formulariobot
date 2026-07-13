const N8N_WEBHOOK_URL = "https://gummy-aerosol-deforest.ngrok-free.dev/webhook/registro-estudiantes";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-registro");
  const btn = document.getElementById("boton-enviar");
  const mensaje = document.getElementById("mensaje-estado");
  const campoTelegram = document.getElementById("telegram_user");

  // Rellena automáticamente el telegram_user desde el enlace que envía el bot,
  // ej: registro.html?telegram_user=8647960015
  const params = new URLSearchParams(window.location.search);
  const idDesdeUrl = params.get("telegram_user");
  if (idDesdeUrl) {
    campoTelegram.value = idDesdeUrl;
  }

  function marcarError(nombreCampo, texto) {
    const span = form.querySelector(`[data-error-for="${nombreCampo}"]`);
    const input = document.getElementById(nombreCampo);
    if (span) span.textContent = texto || "";
    if (input) input.classList.toggle("campo--invalido", !!texto);
  }

  function limpiarErrores() {
    form.querySelectorAll(".campo__error").forEach(s => (s.textContent = ""));
    form.querySelectorAll("input").forEach(i => i.classList.remove("campo--invalido"));
  }

  function validar(datos) {
    let ok = true;
    if (!datos.nombre || datos.nombre.trim().length < 3) {
      marcarError("nombre", "Escribe tu nombre completo.");
      ok = false;
    }
    if (!datos.codigo_estudiante || datos.codigo_estudiante.trim().length < 3) {
      marcarError("codigo_estudiante", "Ingresa tu código de estudiante.");
      ok = false;
    }
    if (!datos.telegram_user) {
      marcarError("telegram_user", "Falta tu ID de Telegram. Abre este formulario desde el bot.");
      ok = false;
    }
    return ok;
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    limpiarErrores();
    mensaje.textContent = "";
    mensaje.removeAttribute("data-tipo");

    const datos = {
      nombre: document.getElementById("nombre").value.trim(),
      codigo_estudiante: document.getElementById("codigo_estudiante").value.trim(),
      telegram_user: campoTelegram.value.trim(),
    };

    if (!validar(datos)) return;

    btn.disabled = true;
    btn.querySelector(".boton__texto").textContent = "Enviando…";

    try {
      const respuesta = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const cuerpo = await respuesta.json().catch(() => ({}));

      if (respuesta.ok && cuerpo.status === "ok") {
        mensaje.textContent = "Registro enviado. Vuelve al chat de Telegram y escribe 'listo'.";
        mensaje.setAttribute("data-tipo", "ok");
        form.reset();
        if (idDesdeUrl) campoTelegram.value = idDesdeUrl;
        btn.querySelector(".boton__texto").textContent = "Registro enviado";
      } else {
        mensaje.textContent = cuerpo.mensaje || "No se pudo completar el registro. Intenta de nuevo.";
        mensaje.setAttribute("data-tipo", "error");
        btn.disabled = false;
        btn.querySelector(".boton__texto").textContent = "Enviar registro";
      }
    } catch (error) {
      mensaje.textContent = "No hay conexión con el servidor. Revisa tu internet e intenta otra vez.";
      mensaje.setAttribute("data-tipo", "error");
      btn.disabled = false;
      btn.querySelector(".boton__texto").textContent = "Enviar registro";
    }
  });
});
