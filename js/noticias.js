const RUTA_NOTICIAS = "data/noticias.json";
const IDIOMA_FECHAS = "es-ES";
const MENSAJE_ERROR = "No se pudieron cargar las noticias en este momento.";
const MENSAJE_SIN_NOTICIAS = "Todavía no hay noticias publicadas.";

const contenedorNoticias = document.getElementById("listaNoticias");

function formatearFecha(fechaIso) {
    return new Date(fechaIso).toLocaleDateString(IDIOMA_FECHAS, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
    });
}

function crearTarjetaNoticia(noticia) {
    const articulo = document.createElement("article");
    articulo.classList.add("noticia");

    const titulo = document.createElement("h3");
    titulo.textContent = noticia.titulo;

    const fecha = document.createElement("time");
    fecha.dateTime = noticia.fecha; // formato máquina, para el atributo datetime
    fecha.textContent = formatearFecha(noticia.fecha); // formato persona

    const resumen = document.createElement("p");
    resumen.textContent = noticia.resumen;

    articulo.append(titulo, fecha, resumen);
    return articulo;
}

function mostrarNoticias(listaNoticias) {
    contenedorNoticias.textContent = ""; // vacía el contenedor antes de mostrarse

    if(listaNoticias.length === 0) {
        contenedorNoticias.textContent = MENSAJE_SIN_NOTICIAS;
        return;
    }

    for(const noticia of listaNoticias) {
        contenedorNoticias.append(crearTarjetaNoticia(noticia));
    }
}

async function cargarNoticias() {
    try{
        const respuesta = await fetch(RUTA_NOTICIAS);

        if(!respuesta.ok) {
            throw new Error(`Error ${respuesta.status} al cargar ${RUTA_NOTICIAS}`);
        }

        const datos = await respuesta.json();
        if (!datos || !Array.isArray(datos.noticias)) {
            throw new Error("El archivo de noticias no contiene una lista válida.");
        }
        mostrarNoticias(datos.noticias);
    } catch(error) {
        console.error(error);
        contenedorNoticias.textContent = MENSAJE_ERROR;
    }
}

cargarNoticias();