//ubicación de la librería
const COORDENADAS_LIBRERIA = [43.26597, -2.93785];
const NOMBRE_LIBRERIA = "Librería Avalón";
const DIRECCION_LIBRERIA = "Museo Plaza, 2, 48009 Bilbao";

//mapa
const ZOOM_INICIAL = 16;
const ZOOM_MAXIMO = 19;
const URL_TESELAS = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATRIBUCION = '&copy; <a href="https://www.openstreetmap.org/copyright">Colaboradores de OpenStreetMap</a>';

//ruta
const IDIOMA = "es";
const COLOR_RUTA = "#1f4d3a";
const GROSOR_RUTA = 6;
const METROS_POR_KM = 1000;
const SEGUNDOS_POR_MINUTO = 60;

const OPCIONES_GEOLOCALIZACION = {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 60000
};

//mensajes para el usuario
const MENSAJE_BUSCANDO = "Buscando tu ubicación…";
const MENSAJE_CALCULANDO = "Calculando la ruta…";
const MENSAJE_SIN_GEOLOCALIZACION =
    "Tu navegador no permite la geolocalización. Haz clic en el mapa para elegir tu punto de partida.";
const MENSAJE_PERMISO_DENEGADO =
    "No has dado permiso para usar tu ubicación. Haz clic en el mapa para elegir tu punto de partida.";
const MENSAJE_POSICION_NO_DISPONIBLE =
    "No se ha podido determinar tu ubicación. Haz clic en el mapa para elegir tu punto de partida.";
const MENSAJE_TIEMPO_AGOTADO =
    "La búsqueda de tu ubicación ha tardado demasiado. Inténtalo de nuevo o haz clic en el mapa.";
const MENSAJE_ERROR_RUTA =
    "No se ha podido calcular la ruta. Inténtalo de nuevo en unos minutos.";

const botonRuta = document.getElementById("botonRuta");
const estadoRuta = document.getElementById("estadoRuta");

//mapa, capa de teselas y marcador de la librería
const mapaLeaflet = L.map("mapa").setView(COORDENADAS_LIBRERIA, ZOOM_INICIAL);

L.tileLayer(URL_TESELAS, {
    maxZoom: ZOOM_MAXIMO,
    attribution: ATRIBUCION
}).addTo(mapaLeaflet);

L.marker(COORDENADAS_LIBRERIA, {
    title: NOMBRE_LIBRERIA,
    alt: `Ubicación de ${NOMBRE_LIBRERIA}`
})
.addTo(mapaLeaflet)
.bindPopup(`<strong>${NOMBRE_LIBRERIA}</strong><br>${DIRECCION_LIBRERIA}`)
.openPopup();

//cálculo de la ruta
let controlRuta = null;

function mostrarEstado(texto) {
    estadoRuta.textContent = texto;
}

// Convierte metros y segundos en una frase: "3,2 km, unos 8 min en coche"
function describirRuta(resumen) {
    const km = (resumen.totalDistance / METROS_POR_KM).toLocaleString(IDIOMA, {
    maximumFractionDigits: 1
    });
    const minutos = Math.max(1, Math.round(resumen.totalTime / SEGUNDOS_POR_MINUTO));
    return `Ruta calculada: ${km} km, unos ${minutos} min en coche.`;
}

function crearMarcador(indice, waypoint) {
    if (indice === 0) {
        return L.marker(waypoint.latLng, {
            title: "Tu punto de partida",
            alt: "Tu punto de partida"
        });
    }
    return null;
}

function calcularRuta(origen) {
    const puntos = [L.latLng(origen), L.latLng(COORDENADAS_LIBRERIA)];
    mostrarEstado(MENSAJE_CALCULANDO);

  // Si ya existe una ruta, solo se cambian sus puntos y no se crea otra
    if (controlRuta) {
        controlRuta.setWaypoints(puntos);
    return;
    }

    controlRuta = L.Routing.control({
        waypoints: puntos,
        router: L.Routing.osrmv1({ language: IDIOMA }),
        language: IDIOMA,
        lineOptions: { styles: [{ color: COLOR_RUTA, weight: GROSOR_RUTA }] },
        createMarker: crearMarcador,
        addWaypoints: false,      // no permite añadir paradas con clics
        routeWhileDragging: false,
        fitSelectedRoutes: true,  // el mapa se ajusta para ver toda la ruta
        collapsible: true         // el panel de instrucciones se puede plegar
    }).addTo(mapaLeaflet);

    controlRuta.on("routesfound", function (evento) {
        mostrarEstado(describirRuta(evento.routes[0].summary));
    });

    controlRuta.on("routingerror", function () {
        mostrarEstado(MENSAJE_ERROR_RUTA);
    });
}

//Localización del cliente
function alObtenerPosicion(posicion) {
    calcularRuta(L.latLng(posicion.coords.latitude, posicion.coords.longitude));
}

function alFallarPosicion(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            mostrarEstado(MENSAJE_PERMISO_DENEGADO);
        break;
        case error.TIMEOUT:
            mostrarEstado(MENSAJE_TIEMPO_AGOTADO);
        break;
        default: // POSITION_UNAVAILABLE u otro motivo
            mostrarEstado(MENSAJE_POSICION_NO_DISPONIBLE);
    }
}

function localizarCliente() {
    if (!("geolocation" in navigator)) {
        mostrarEstado(MENSAJE_SIN_GEOLOCALIZACION);
    return;
    }
    mostrarEstado(MENSAJE_BUSCANDO);
    navigator.geolocation.getCurrentPosition(alObtenerPosicion, alFallarPosicion,
    OPCIONES_GEOLOCALIZACION);
}

//eventos
/* El permiso de ubicación se pide solo cuando el usuario pulsa el botón,
no al cargar la página*/
botonRuta.addEventListener("click", localizarCliente);

// Alternativa: un clic en el mapa fija el punto de partida
mapaLeaflet.on("click", function (evento) {
    calcularRuta(evento.latlng);
});