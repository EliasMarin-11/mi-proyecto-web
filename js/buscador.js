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

        // Ejecutar búsqueda manual al darle al botón
        if (e.target.closest('#btn-buscar') || e.target.closest('.btn-aplicar-filtros')) {
            e.preventDefault();
            procesarBusqueda();
        }

        // Borrar un ingrediente de la lista (clic en la X)
        if (e.target.matches('.tag span')) {
            const index = e.target.getAttribute('data-index');
            listaIngredientes.splice(index, 1);
            actualizarTagsDOM();
            // Auto-buscar al borrar una etiqueta
            if (window.location.pathname.toLowerCase().includes('buscador.html')) {
                ejecutarBusqueda(listaIngredientes);
            }
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

                // Auto-buscar al añadir con Enter
                if (window.location.pathname.toLowerCase().includes('buscador.html')) {
                    ejecutarBusqueda(listaIngredientes);
                }
            }
            e.target.value = '';
        }
    });

    // AUTO-BÚSQUEDA AL MARCAR FILTROS CHECKBOX
    document.addEventListener('change', (e) => {
        if (e.target.matches('.dropdown-bruto input[type="checkbox"]')) {
            if (window.location.pathname.toLowerCase().includes('buscador.html')) {
                ejecutarBusqueda(listaIngredientes);
            }
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
            actualizarTagsDOM();
        }
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
                return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
            };

            const recetasFiltradas = data.recetas.filter(receta => {

                // 1. FILTRO DE INGREDIENTES
                let coincideIngrediente = ingredientesBuscados.length === 0 || ingredientesBuscados.every(ingBuscado => {
                    const termino = normalizar(ingBuscado.trim());

                    const enTitulo = receta.titulo && normalizar(receta.titulo).includes(termino);
                    const enClave = Array.isArray(receta.ingredientes_clave) && receta.ingredientes_clave.some(ing => normalizar(ing).includes(termino));
                    const enNormal = Array.isArray(receta.ingredientes) && receta.ingredientes.some(ing => normalizar(ing).includes(termino));

                    return enTitulo || enClave || enNormal;
                });

                if (!coincideIngrediente) return false;

                // 2. FILTROS AVANZADOS
                if (checkboxesActivos.length > 0) {

                    // A) DIFICULTAD
                    const filtrosDificultad = checkboxesActivos.filter(val => ['facil', 'media', 'dificil'].includes(normalizar(val)));
                    if (filtrosDificultad.length > 0) {
                        const difReceta = normalizar(receta.dificultad);
                        if (!filtrosDificultad.includes(difReceta)) return false;
                    }

                    // B) DURACIÓN
                    const filtrosDuracion = checkboxesActivos.filter(val => ['rapido', 'medio', 'lento'].includes(normalizar(val)));
                    if (filtrosDuracion.length > 0) {
                        let minReceta = 0;
                        const tiempoStr = normalizar(receta.tiempo || receta.duracion_categoria || "");

                        const numMatch = tiempoStr.match(/\d+/);
                        if (numMatch) {
                            minReceta = parseInt(numMatch[0]);
                            if (tiempoStr.includes('hora')) {
                                minReceta = minReceta * 60;
                            }
                        }

                        let encajaTiempo = false;
                        if (filtrosDuracion.includes('rapido') && minReceta > 0 && minReceta <= 30) encajaTiempo = true;
                        if (filtrosDuracion.includes('medio') && minReceta > 30 && minReceta <= 60) encajaTiempo = true;
                        if (filtrosDuracion.includes('lento') && minReceta > 60) encajaTiempo = true;

                        if (!encajaTiempo) return false;
                    }

                    // C) TIPO DE PLATO
                    const filtrosPlato = checkboxesActivos.filter(val => ['primero', 'segundo', 'cuchara', 'postre'].includes(normalizar(val)));
                    if (filtrosPlato.length > 0) {
                        const platoReceta = normalizar(receta.tipo_plato || "");
                        if (!filtrosPlato.includes(platoReceta)) return false;
                    }

                    // D) ALÉRGENOS / DIETA
                    const filtrosDieta = checkboxesActivos.filter(val => ['vegetariano', 'vegano', 'singluten', 'sinlactosa'].includes(normalizar(val)));
                    if (filtrosDieta.length > 0) {
                        for (let dietaReq of filtrosDieta) {
                            if (dietaReq === 'vegetariano' || dietaReq === 'vegano') {
                                if (!Array.isArray(receta.dieta) || !receta.dieta.some(d => normalizar(d) === dietaReq)) return false;
                            }
                            if (dietaReq === 'singluten') {
                                if (Array.isArray(receta.alergenos) && receta.alergenos.some(a => normalizar(a).includes('gluten'))) return false;
                            }
                            if (dietaReq === 'sinlactosa') {
                                if (Array.isArray(receta.alergenos) && receta.alergenos.some(a => normalizar(a).includes('lacteo'))) return false;
                            }
                        }
                    }

                    // E) VALORACIÓN ESTRELLAS
                    const filtrosEstrellas = checkboxesActivos.filter(val => normalizar(val).includes('estrellas-'));
                    if (filtrosEstrellas.length > 0) {
                        let limiteEstrellas = 0;
                        filtrosEstrellas.forEach(f => {
                            const numero = parseInt(f.replace('estrellas-', ''));
                            if (!isNaN(numero) && numero > limiteEstrellas) {
                                limiteEstrellas = numero;
                            }
                        });

                        const estrellasReceta = receta.estrellas || 0;
                        if (estrellasReceta < limiteEstrellas) return false;
                    }
                }

                return true;
            });

            // Renderizado
            const parser = new DOMParser();
            const templateDoc = parser.parseFromString(templateString, 'text/html');
            const templateBase = templateDoc.body.firstElementChild;

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
                        detallesList[0].textContent = `⏱️ ${receta.tiempo || receta.duracion_categoria}`;
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