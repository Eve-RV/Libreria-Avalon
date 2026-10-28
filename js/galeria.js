$(function() {
    const FILTRO_TODAS = "todas";
    const CLASE_OCULTA = "oculta";          // oculta un elemento filtrado
    const CLASE_VISOR_ABIERTO = "abierto";  // marca el visor como abierto
    const CLASE_BODY_BLOQUEADO = "visor-abierto"; // bloquea el scroll de la página
    const DURACION_FUNDIDO = 200;           // milisegundos

    const $galeria = $("#galeria");
    const $items = $galeria.find(".galeria-item");
    const $filtros = $(".filtro");

    const $visor = $("#visor");
    const $visorImagen = $("#visorImagen");
    const $visorPie = $("#visorPie");
    const $botonCerrar = $("#visorCerrar");
    const $botonAnterior = $("#visorAnterior");
    const $botonSiguiente = $("#visorSiguiente");

    //Estado del visor
    let indiceActual = 0;        // posición dentro de las imágenes VISIBLES
    let $miniaturaOrigen = null; // botón que abrió el visor (es para devolverle el foco)

    //filtrado
    function filtrar(categoria) {
        $items.each(function () {
            const $item = $(this);
            const coincide = categoria === FILTRO_TODAS || $item.data("categoria") === categoria;
            $item.toggleClass(CLASE_OCULTA, !coincide);
        });
    }

    $filtros.on("click", function () {
        const $boton = $(this);
        $filtros.attr("aria-pressed", "false");
        $boton.attr("aria-pressed", "true");
        filtrar($boton.data("filtro"));
    });

    //visor ampliado
    
    // Solo se navega entre las imágenes que el filtro deja visibles
    function itemsVisibles() {
        return $items.not("." + CLASE_OCULTA);
    }

    function mostrarImagen(indice) {
        const $visibles = itemsVisibles();
        const total = $visibles.length;
        if (total === 0) return;

        // Índice circular: tras la última vuelve a la primera y viceversa
        indiceActual = (indice + total) % total;

        const $item = $visibles.eq(indiceActual);
        const $imagen = $item.find("img");
        // Si la miniatura declara data-grande se usa esa ruta; si no, la misma imagen
        const rutaGrande = $item.find(".miniatura").data("grande") || $imagen.attr("src");

        $visorImagen.attr({ src: rutaGrande, alt: $imagen.attr("alt") });
        $visorPie.text(`${$item.find("figcaption").text()} (${indiceActual + 1} de ${total})`);
    }

    function abrirVisor($item) {
        $miniaturaOrigen = $item.find(".miniatura");
        mostrarImagen(itemsVisibles().index($item));

        $visor.attr("aria-hidden", "false").addClass(CLASE_VISOR_ABIERTO).fadeIn(DURACION_FUNDIDO);
        $("body").addClass(CLASE_BODY_BLOQUEADO);
        $botonCerrar.trigger("focus"); // el foco se mueve dentro del diálogo
    }

    function cerrarVisor() {
        $visor.attr("aria-hidden", "true").removeClass(CLASE_VISOR_ABIERTO).fadeOut(DURACION_FUNDIDO);
        $("body").removeClass(CLASE_BODY_BLOQUEADO);
        if ($miniaturaOrigen) {
            $miniaturaOrigen.trigger("focus"); // el foco vuelve a donde estaba
        }
    }

    /* Delegación de eventos: un solo listener en el contenedor atiende a todas las miniaturas (los clics "burbujean" hasta #galeria)*/
    $galeria.on("click", ".miniatura", function () {
        abrirVisor($(this).closest(".galeria-item"));
    });

    $botonCerrar.on("click", cerrarVisor);
    $botonAnterior.on("click", function () { mostrarImagen(indiceActual - 1); });
    $botonSiguiente.on("click", function () { mostrarImagen(indiceActual + 1); });

    // Clic en el fondo oscuro (no en la imagen ni en los botones) cierra el visor
    $visor.on("click", function (evento) {
        if (evento.target === this) cerrarVisor();
    });

    // Atajos de teclado mientras el visor está abierto.
    $(document).on("keydown", function (evento) {
        if (!$visor.hasClass(CLASE_VISOR_ABIERTO)) return;
        if (evento.key === "Escape") {
            evento.preventDefault();
            cerrarVisor();
        } else if (evento.key === "ArrowLeft") {
            evento.preventDefault();
            mostrarImagen(indiceActual - 1);
        } else if (evento.key === "ArrowRight") {
            evento.preventDefault();
            mostrarImagen(indiceActual + 1);
        } else if (evento.key === "Tab") {
            // Mantiene el foco dentro del diálogo modal.
            const $controles = $visor.find("button:visible");
            const primero = $controles.get(0);
            const ultimo = $controles.get($controles.length - 1);
            if (evento.shiftKey && document.activeElement === primero) {
                evento.preventDefault();
                $(ultimo).trigger("focus");
            } else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault();
                $(primero).trigger("focus");
            }
        }
    });
});