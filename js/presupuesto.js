"use strict";

const formulario = document.getElementById("formPresupuesto");

// Descuentos aplicables según el plazo seleccionado.
const PLAZO_DESCUENTO_MEDIO = 3;
const PLAZO_DESCUENTO_ALTO = 6;
const DESCUENTO_MEDIO = 0.05;
const DESCUENTO_ALTO = 0.10;
const PLAZO_MINIMO = 1;
const PLAZO_MAXIMO = 12;
const MAX_NOMBRE = 15;
const MAX_APELLIDOS = 40;
const MAX_TELEFONO = 9;
const PRODUCTO_SIN_ELEGIR = "0";

const REGEX_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñÀÈÌÒÙàèìòùÇç\s'-]+$/;
const REGEX_APELLIDOS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñÀÈÌÒÙàèìòùÇç\s'-]+$/;
const REGEX_TELEFONO = /^[0-9]{9}$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const campoNombre = document.getElementById("nombre");
const campoApellidos = document.getElementById("apellidos");
const campoTelefono = document.getElementById("telefono");
const campoEmail = document.getElementById("email");
const campoProducto = document.getElementById("producto");
const campoPlazo = document.getElementById("plazo");
const campoCondiciones = document.getElementById("condiciones");
const salidaTotal = document.getElementById("total");
const mensajeEnvio = document.getElementById("mensajeEnvio");

const errorNombre = document.getElementById("errorNombre");
const errorApellidos = document.getElementById("errorApellidos");
const errorTelefono = document.getElementById("errorTelefono");
const errorEmail = document.getElementById("errorEmail");
const errorProducto = document.getElementById("errorProducto");
const errorPlazo = document.getElementById("errorPlazo");
const errorCondiciones = document.getElementById("errorCondiciones");

function mostrarError(campo, contenedorError, mensaje) {
    contenedorError.textContent = mensaje;
    if (mensaje) {
        campo.setAttribute("aria-invalid", "true");
    } else {
        campo.removeAttribute("aria-invalid");
    }
    return mensaje === "";
}

function validarNombre() {
    const nombre = campoNombre.value.trim();
    let mensaje = "";
    if (!nombre) {
        mensaje = "El nombre es obligatorio.";
    } else if (!REGEX_SOLO_LETRAS.test(nombre)) {
        mensaje = "El nombre solo puede contener letras, espacios, apóstrofos o guiones.";
    } else if (nombre.length > MAX_NOMBRE) {
        mensaje = `El nombre no puede superar los ${MAX_NOMBRE} caracteres.`;
    }
    return mostrarError(campoNombre, errorNombre, mensaje);
}

function validarApellidos() {
    const apellidos = campoApellidos.value.trim();
    let mensaje = "";
    if (!apellidos) {
        mensaje = "Los apellidos son obligatorios.";
    } else if (!REGEX_APELLIDOS.test(apellidos)) {
        mensaje = "Los apellidos solo pueden contener letras, espacios, apóstrofos o guiones.";
    } else if (apellidos.length > MAX_APELLIDOS) {
        mensaje = `Los apellidos no pueden superar los ${MAX_APELLIDOS} caracteres.`;
    }
    return mostrarError(campoApellidos, errorApellidos, mensaje);
}

function validarTelefono() {
    const telefono = campoTelefono.value.trim();
    let mensaje = "";
    if (!telefono) {
        mensaje = "El teléfono es obligatorio.";
    } else if (!REGEX_TELEFONO.test(telefono)) {
        mensaje = "Introduce un teléfono español de 9 dígitos, sin espacios ni prefijo.";
    }
    return mostrarError(campoTelefono, errorTelefono, mensaje);
}

function validarEmail() {
    const email = campoEmail.value.trim();
    let mensaje = "";
    if (!email) {
        mensaje = "El correo electrónico es obligatorio.";
    } else if (!REGEX_EMAIL.test(email)) {
        mensaje = "Introduce un correo electrónico válido (ejemplo: nombre@dominio.com).";
    }
    return mostrarError(campoEmail, errorEmail, mensaje);
}

function validarProducto() {
    const mensaje = campoProducto.value === PRODUCTO_SIN_ELEGIR ? "Elige un pack." : "";
    return mostrarError(campoProducto, errorProducto, mensaje);
}

function validarPlazo() {
    const valor = campoPlazo.value.trim();
    const plazo = Number(valor);
    let mensaje = "";
    if (!valor) {
        mensaje = "Indica el plazo de entrega.";
    } else if (!Number.isInteger(plazo) || plazo < PLAZO_MINIMO || plazo > PLAZO_MAXIMO) {
        mensaje = `El plazo debe ser un número entero entre ${PLAZO_MINIMO} y ${PLAZO_MAXIMO} meses.`;
    }
    return mostrarError(campoPlazo, errorPlazo, mensaje);
}

function validarCondiciones() {
    const mensaje = campoCondiciones.checked ? "" : "Debes aceptar la política de privacidad.";
    return mostrarError(campoCondiciones, errorCondiciones, mensaje);
}

function calcularPresupuesto() {
    // No se calcula un importe de pack hasta que se haya elegido un producto.
    if (campoProducto.value === PRODUCTO_SIN_ELEGIR || campoProducto.value === "") {
        salidaTotal.value = "0.00";
        return;
    }

    const precioProducto = Number(campoProducto.value);
    const extrasMarcados = document.querySelectorAll('input[name="extra"]:checked');
    let totalExtras = 0;
    for (const extra of extrasMarcados) {
        totalExtras += Number(extra.value);
    }

    const plazo = Number(campoPlazo.value);
    let descuento = 0;
    if (Number.isInteger(plazo) && plazo >= PLAZO_DESCUENTO_ALTO && plazo <= PLAZO_MAXIMO) {
        descuento = DESCUENTO_ALTO;
    } else if (Number.isInteger(plazo) && plazo >= PLAZO_DESCUENTO_MEDIO && plazo < PLAZO_DESCUENTO_ALTO) {
        descuento = DESCUENTO_MEDIO;
    }

    const total = (precioProducto + totalExtras) * (1 - descuento);
    salidaTotal.value = total.toFixed(2);
}

function mostrarConfirmacion() {
    const nombre = campoNombre.value.trim();
    const email = campoEmail.value.trim();
    const total = salidaTotal.value;
    mensajeEnvio.textContent = `Gracias, ${nombre}. La validación ha finalizado correctamente. Presupuesto estimado: ${total} €. El correo indicado es ${email}. Esta demostración no envía datos a un servidor.`;
}

// Validar al salir del campo y actualizar los errores mientras se corrigen los datos.
campoNombre.addEventListener("blur", validarNombre);
campoNombre.addEventListener("input", () => { if (errorNombre.textContent) validarNombre(); });
campoApellidos.addEventListener("blur", validarApellidos);
campoApellidos.addEventListener("input", () => { if (errorApellidos.textContent) validarApellidos(); });
campoTelefono.addEventListener("blur", validarTelefono);
campoTelefono.addEventListener("input", () => { if (errorTelefono.textContent) validarTelefono(); });
campoEmail.addEventListener("blur", validarEmail);
campoEmail.addEventListener("input", () => { if (errorEmail.textContent) validarEmail(); });
campoProducto.addEventListener("change", () => { validarProducto(); calcularPresupuesto(); });
campoPlazo.addEventListener("change", () => { validarPlazo(); calcularPresupuesto(); });
campoPlazo.addEventListener("input", calcularPresupuesto);
campoCondiciones.addEventListener("change", validarCondiciones);
formulario.addEventListener("change", (evento) => {
    if (evento.target.matches('input[name="extra"]')) calcularPresupuesto();
});

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mensajeEnvio.textContent = "";
    calcularPresupuesto();

    const formularioValido = [
        validarNombre(),
        validarApellidos(),
        validarTelefono(),
        validarEmail(),
        validarProducto(),
        validarPlazo(),
        validarCondiciones()
    ].every(Boolean);

    if (formularioValido) {
        mostrarConfirmacion();
        const confirmacion = mensajeEnvio.textContent;
        formulario.reset();
        
        setTimeout(() => {
            mensajeEnvio.textContent = confirmacion;
        })
    }
    else {
        const primerCampoInvalido = formulario.querySelector('[aria-invalid="true"]');
        if (primerCampoInvalido) primerCampoInvalido.focus();
    }
});

formulario.addEventListener("reset", () => {
    // El evento reset ocurre antes de que el navegador restaure los valores.
    setTimeout(() => {
        document.querySelectorAll(".error").forEach((elemento) => { elemento.textContent = ""; });
        formulario.querySelectorAll("[aria-invalid]").forEach((campo) => campo.removeAttribute("aria-invalid"));
        mensajeEnvio.textContent = "";
        calcularPresupuesto();
    }, 0);
});

calcularPresupuesto();
