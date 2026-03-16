let listaIngredientes = [];

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const queryInicial = params.get('q');

    // Inicializar ingredientes desde la URL si existen
    if (queryInicial) {
        listaIngredientes = queryInicial.split(',').filter(i => i.trim() !== '');
        setTimeout(actualizarTagsDOM, 500);
    }

    // Ejecutar búsqueda inicial si estamos en la página correcta
    if (window.location.pathname.toLowerCase().includes('buscador.html')) {
        ejecutarBusqueda(listaIngredientes);
    }

    // Delegación de eventos de clic
    document.addEventListener('click', (e) => {

        // Alternar menú de filtros
        if (e.target.closest('#btn-filtros')) {
            const menuFiltros = document.getElementById('menu-filtros');
            if (menuFiltros) menuFiltros.classList.toggle('oculto');
        }

        // Ejecutar búsqueda manual
        if (e.target.closest('#btn-buscar')) {
            e.preventDefault();
            procesarBusqueda();
        }

        // Borrar un ingrediente de la lista (clic en la X)
        if (e.target.matches('.tag span')) {
            const index = e.target.getAttribute('data-index');
            listaIngredientes.splice(index, 1);
            actualizarTagsDOM();
        }

        // Cerrar menú de filtros al hacer clic fuera
        const menuFiltros = document.getElementById('menu-filtros');
        if (menuFiltros && !e.target.closest('#btn-filtros') && !e.target.closest('#menu-filtros')) {
            menuFiltros.classList.add('oculto');
        }
    });

    // Añadir ingrediente al pulsar Enter en el input
    document.addEventListener('keypress', (e) => {
        if (e.target.id === 'input-ingrediente' && e.key === 'Enter') {
            e.preventDefault();
            const nuevoIngrediente = e.target.value.trim().toLowerCase();

            if (nuevoIngrediente !== '' && !listaIngredientes.includes(nuevoIngrediente)) {
                listaIngredientes.push(nuevoIngrediente);
                actualizarTagsDOM();
            }
            e.target.value = '';
        }
    });
});

function procesarBusqueda() {
    const input = document.getElementById('input-ingrediente');

    // Recuperar texto suelto en el input antes de buscar
    if (input) {
        const textoSuelto = input.value.trim().toLowerCase();
        if (textoSuelto && !listaIngredientes.includes(textoSuelto)) {
            listaIngredientes.push(textoSuelto);
            input.value = '';
        }
    }

    if (listaIngredientes.length === 0) {
        alert("¡Añade algún ingrediente primero!");
        return;
    }

    const query = listaIngredientes.join(',');

    if (window.location.pathname.toLowerCase().includes('buscador.html')) {
        window.history.pushState({}, '', `buscador.html?q=${query}`);
        ejecutarBusqueda(listaIngredientes);
    } else {
        window.location.href = `buscador.html?q=${query}`;
    }
}

function actualizarTagsDOM() {
    const contenedor = document.getElementById('contenedor-tags');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    listaIngredientes.forEach((ingrediente, index) => {
        const palabraLimpia = ingrediente.charAt(0).toUpperCase() + ingrediente.slice(1);

        // Creación pura de nodos DOM (evita inyecciones HTML)
        const divTag = document.createElement('div');
        divTag.className = 'tag';
        divTag.textContent = palabraLimpia + ' ';

        const spanBorrar = document.createElement('span');
        spanBorrar.textContent = '✖';
        spanBorrar.setAttribute('data-index', index);
        spanBorrar.title = 'Borrar';
        spanBorrar.style.cursor = 'pointer';
        spanBorrar.style.marginLeft = '5px';

        divTag.appendChild(spanBorrar);
        contenedor.appendChild(divTag);
    });
}

function ejecutarBusqueda(ingredientesBuscados) {
    const contenedorResultados = document.getElementById('resultados_lista');
    if (!contenedorResultados) return;

    contenedorResultados.innerHTML = '';

    Promise.all([
        fetch('data/db.json').then(res => res.json()),
        fetch('templates/tarjeta_receta_horizontal.html').then(res => res.text())
    ])
        .then(([data, templateString]) => {

            const checkboxesActivos = Array.from(document.querySelectorAll('.dropdown-bruto input[type="checkbox"]:checked')).map(cb => cb.value);

            const normalizar = (texto) => {
                if (!texto) return "";
                return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            };

            const recetasFiltradas = data.recetas.filter(receta => {

                // Filtro principal por ingredientes
                let coincideIngrediente = ingredientesBuscados.length === 0 || ingredientesBuscados.every(ingBuscado => {
                    const termino = normalizar(ingBuscado.trim());

                    const enTitulo = receta.titulo && normalizar(receta.titulo).includes(termino);
                    const enClave = Array.isArray(receta.ingredientes_clave) && receta.ingredientes_clave.some(ing => normalizar(ing).includes(termino));
                    const enNormal = Array.isArray(receta.ingredientes) && receta.ingredientes.some(ing => normalizar(ing).includes(termino));

                    return enTitulo || enClave || enNormal;
                });

                if (!coincideIngrediente) return false;

                if (checkboxesActivos.length > 0) {
                    const filtrosDificultad = checkboxesActivos.filter(val => ['facil', 'media', 'dificil'].includes(val));
                    if (filtrosDificultad.length > 0) {
                        const difReceta = normalizar(receta.dificultad);
                        if (!filtrosDificultad.includes(difReceta)) return false;
                    }

                    const filtrosDieta = checkboxesActivos.filter(val => ['singluten', 'sinlactosa', 'vegetariano', 'vegano'].includes(val));
                    if (filtrosDieta.length > 0) {
                        if (!Array.isArray(receta.dieta)) return false;
                        const cumpleDieta = filtrosDieta.every(dietaReq => receta.dieta.some(d => normalizar(d) === normalizar(dietaReq)));
                        if (!cumpleDieta) return false;
                    }
                }

                return true;
            });

            // Configuración de la plantilla base
            const parser = new DOMParser();
            const templateDoc = parser.parseFromString(templateString, 'text/html');
            const templateBase = templateDoc.body.firstElementChild;

            // Renderizado de tarjetas o mensaje de feedback
            if (recetasFiltradas.length > 0) {
                recetasFiltradas.forEach(receta => {
                    const tarjetaDom = templateBase.cloneNode(true);

                    const tituloEl = tarjetaDom.querySelector('h3') || tarjetaDom.querySelector('.titulo-receta');
                    if (tituloEl) tituloEl.textContent = receta.titulo;

                    const enlaceEl = tarjetaDom.querySelector('a');
                    if (enlaceEl) enlaceEl.href = receta.enlace;

                    const contenedorImg = tarjetaDom.querySelector('.receta-dummy-img');
                    if (contenedorImg) {
                        const newImg = document.createElement('img');
                        newImg.src = receta.imagen;
                        newImg.alt = receta.titulo;
                        newImg.className = 'img-receta-detalle';
                        contenedorImg.replaceWith(newImg);
                    } else {
                        const imgEl = tarjetaDom.querySelector('img');
                        if (imgEl) {
                            imgEl.src = receta.imagen;
                            imgEl.alt = receta.titulo;
                        }
                    }

                    const descEl = tarjetaDom.querySelector('p');
                    if (descEl) {
                        descEl.textContent = receta.descripcion.length > 120 ? receta.descripcion.substring(0, 120) + '...' : receta.descripcion;
                    }

                    const detallesList = tarjetaDom.querySelectorAll('li');
                    if (detallesList.length >= 3) {
                        detallesList[0].textContent = `⏱️ ${receta.tiempo}`;
                        detallesList[1].textContent = `👨‍🍳 ${receta.dificultad.charAt(0).toUpperCase() + receta.dificultad.slice(1)}`;
                        detallesList[2].textContent = `⭐ ${receta.estrellas}`;
                    }

                    contenedorResultados.appendChild(tarjetaDom);
                });

            } else {
                const mensajeVacio = document.createElement('div');
                mensajeVacio.className = 'mensaje-sin-resultados';

                const iconoVacio = document.createElement('div');
                iconoVacio.className = 'icono-vacio';
                iconoVacio.textContent = '🍽️';

                const tituloVacio = document.createElement('h3');
                tituloVacio.textContent = '¡Vaya! La nevera está vacía';

                const parrafoVacio = document.createElement('p');
                parrafoVacio.textContent = 'No hemos encontrado recetas con lo que nos pides. Prueba a quitar algún filtro.';

                mensajeVacio.appendChild(iconoVacio);
                mensajeVacio.appendChild(tituloVacio);
                mensajeVacio.appendChild(parrafoVacio);

                contenedorResultados.appendChild(mensajeVacio);
            }
        })
        .catch(error => console.error("Error cargando las recetas:", error));
}