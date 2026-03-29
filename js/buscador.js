let listaIngredientes = [];

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const queryInicial = params.get('q');

    if (queryInicial) {
        listaIngredientes = queryInicial.split(',').filter(i => i.trim() !== '');
        setTimeout(actualizarTagsDOM, 500);
    }

    if (window.location.pathname.toLowerCase().includes('buscador.html')) {
        ejecutarBusqueda(listaIngredientes);
    }

    document.addEventListener('click', (e) => {
        const btnCorazon = e.target.closest('.btn-fav-receta');
        if (btnCorazon) {
            e.preventDefault();
            e.stopPropagation();
            const idReceta = parseInt(btnCorazon.dataset.id);
            toggleFavoritoBuscador(idReceta, btnCorazon);
            return;
        }

        if (e.target.closest('#btn-filtros')) {
            const menuFiltros = document.getElementById('menu-filtros');
            if (menuFiltros) menuFiltros.classList.toggle('oculto');
        }

        if (e.target.closest('#btn-buscar') || e.target.closest('.btn-aplicar-filtros')) {
            e.preventDefault();
            procesarBusqueda();
        }

        if (e.target.matches('.tag span')) {
            const index = e.target.getAttribute('data-index');
            listaIngredientes.splice(index, 1);
            actualizarTagsDOM();
            if (window.location.pathname.toLowerCase().includes('buscador.html')) {
                ejecutarBusqueda(listaIngredientes);
            }
        }

        const menuFiltros = document.getElementById('menu-filtros');
        if (menuFiltros && !e.target.closest('#btn-filtros') && !e.target.closest('#menu-filtros')) {
            menuFiltros.classList.add('oculto');
        }
    });

    document.addEventListener('keypress', (e) => {
        if (e.target.id === 'input-ingrediente' && e.key === 'Enter') {
            e.preventDefault();
            const nuevoIngrediente = e.target.value.trim().toLowerCase();

            if (nuevoIngrediente !== '' && !listaIngredientes.includes(nuevoIngrediente)) {
                listaIngredientes.push(nuevoIngrediente);
                actualizarTagsDOM();
                if (window.location.pathname.toLowerCase().includes('buscador.html')) {
                    ejecutarBusqueda(listaIngredientes);
                }
            }
            e.target.value = '';
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.matches('.dropdown-bruto input[type="checkbox"]')) {
            if (window.location.pathname.toLowerCase().includes('buscador.html')) {
                ejecutarBusqueda(listaIngredientes);
            }
        }
    });
});

function toggleFavoritoBuscador(idReceta, botonDom) {
    const usuarioJson = localStorage.getItem('usuarioLogueado');
    if (!usuarioJson) {
        alert("Debes iniciar sesión para guardar favoritos.");
        return;
    }

    const usuario = JSON.parse(usuarioJson);
    if (!usuario.favoritos) usuario.favoritos = [];

    const index = usuario.favoritos.indexOf(idReceta);

    if (index === -1) {
        usuario.favoritos.push(idReceta);
        botonDom.textContent = '🤎';
    } else {
        usuario.favoritos.splice(index, 1);
        botonDom.textContent = '🤍';
    }

    localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
}

function procesarBusqueda() {
    const input = document.getElementById('input-ingrediente');

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
        window.history.pushState({}, '', `BUSCADOR.html?q=${query}`);
        ejecutarBusqueda(listaIngredientes);
    } else {
        window.location.href = `BUSCADOR.html?q=${query}`;
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

            const usuarioJson = localStorage.getItem('usuarioLogueado');
            const usuario = usuarioJson ? JSON.parse(usuarioJson) : {};
            const misFavoritos = usuario.favoritos || [];

            // --- LEER RESEÑAS LOCALES PARA CALCULAR LA MEDIA ---
            const localesStr = localStorage.getItem('reseñasLocales');
            const reseñasLocalesTodas = localesStr ? JSON.parse(localesStr) : {};

            const checkboxesActivos = Array.from(document.querySelectorAll('.dropdown-bruto input[type="checkbox"]:checked')).map(cb => cb.value);

            const normalizar = (texto) => {
                if (!texto) return "";
                return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
            };

            const recetasFiltradas = data.recetas.filter(receta => {

                // --- 1. CÁLCULO DE LA NOTA MEDIA REAL DE ESTA RECETA ---
                const jsonReseñas = Array.isArray(receta.reseñas) ? receta.reseñas : [];
                const misLocales = reseñasLocalesTodas[receta.id] || [];
                const todasLasReseñas = [...jsonReseñas, ...misLocales];

                let mediaReal = receta.estrellas || 5;
                if (todasLasReseñas.length > 0) {
                    let suma = 0;
                    todasLasReseñas.forEach(r => suma += r.puntuacion);
                    mediaReal = parseFloat((suma / todasLasReseñas.length).toFixed(1));
                }

                // Guardamos la media temporalmente en el objeto receta para usarla luego al pintar
                receta.mediaRealCalculada = mediaReal;

                // --- 2. FILTRO DE INGREDIENTES ---
                let coincideIngrediente = ingredientesBuscados.length === 0 || ingredientesBuscados.every(ingBuscado => {
                    const termino = normalizar(ingBuscado.trim());
                    const enTitulo = receta.titulo && normalizar(receta.titulo).includes(termino);
                    const enClave = Array.isArray(receta.ingredientes_clave) && receta.ingredientes_clave.some(ing => normalizar(ing).includes(termino));
                    const enNormal = Array.isArray(receta.ingredientes) && receta.ingredientes.some(ing => normalizar(ing).includes(termino));
                    return enTitulo || enClave || enNormal;
                });

                if (!coincideIngrediente) return false;

                // --- 3. FILTROS AVANZADOS ---
                if (checkboxesActivos.length > 0) {
                    const filtrosDificultad = checkboxesActivos.filter(val => ['facil', 'media', 'dificil'].includes(normalizar(val)));
                    if (filtrosDificultad.length > 0) {
                        const difReceta = normalizar(receta.dificultad);
                        if (!filtrosDificultad.includes(difReceta)) return false;
                    }

                    const filtrosDuracion = checkboxesActivos.filter(val => ['rapido', 'medio', 'lento'].includes(normalizar(val)));
                    if (filtrosDuracion.length > 0) {
                        let minReceta = 0;
                        const tiempoStr = normalizar(receta.tiempo || receta.duracion_categoria || "");
                        const numMatch = tiempoStr.match(/\d+/);
                        if (numMatch) {
                            minReceta = parseInt(numMatch[0]);
                            if (tiempoStr.includes('hora')) minReceta = minReceta * 60;
                        }

                        let encajaTiempo = false;
                        if (filtrosDuracion.includes('rapido') && minReceta > 0 && minReceta <= 30) encajaTiempo = true;
                        if (filtrosDuracion.includes('medio') && minReceta > 30 && minReceta <= 60) encajaTiempo = true;
                        if (filtrosDuracion.includes('lento') && minReceta > 60) encajaTiempo = true;

                        if (!encajaTiempo) return false;
                    }

                    const filtrosPlato = checkboxesActivos.filter(val => ['primero', 'segundo', 'cuchara', 'postre'].includes(normalizar(val)));
                    if (filtrosPlato.length > 0) {
                        const platoReceta = normalizar(receta.tipo_plato || "");
                        if (!filtrosPlato.includes(platoReceta)) return false;
                    }

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

                    // AHORA EL FILTRO COMPRUEBA LA MEDIA MATEMÁTICA REAL
                    const filtrosEstrellas = checkboxesActivos.filter(val => normalizar(val).includes('estrellas-'));
                    if (filtrosEstrellas.length > 0) {
                        let limiteEstrellas = 0;
                        filtrosEstrellas.forEach(f => {
                            const numero = parseInt(f.replace('estrellas-', ''));
                            if (!isNaN(numero) && numero > limiteEstrellas) {
                                limiteEstrellas = numero;
                            }
                        });

                        if (receta.mediaRealCalculada < limiteEstrellas) return false;
                    }
                }

                return true;
            });

            const parser = new DOMParser();
            const templateDoc = parser.parseFromString(templateString, 'text/html');
            const templateBase = templateDoc.body.firstElementChild;

            if (recetasFiltradas.length > 0) {
                recetasFiltradas.forEach(receta => {
                    const tarjetaDom = templateBase.cloneNode(true);

                    const enlaceEl = tarjetaDom.tagName === 'A' ? tarjetaDom : tarjetaDom.querySelector('a');
                    if (enlaceEl) enlaceEl.href = `VER_RECETA.html?id=${receta.id}`;

                    const tituloEl = tarjetaDom.querySelector('.receta-titulo');
                    if (tituloEl) tituloEl.textContent = receta.titulo;

                    const contenedorImg = tarjetaDom.querySelector('.receta-dummy-img');
                    if (contenedorImg) {
                        const img = document.createElement('img');
                        img.src = receta.imagen;
                        img.alt = receta.titulo;
                        img.className = 'img-tarjeta-horizontal';
                        contenedorImg.innerHTML = '';
                        contenedorImg.appendChild(img);
                    }

                    const descEl = tarjetaDom.querySelector('.detalles-desc p');
                    if (descEl) {
                        descEl.textContent = receta.descripcion.length > 120 ? receta.descripcion.substring(0, 120) + '...' : receta.descripcion;
                    }

                    const detallesList = tarjetaDom.querySelectorAll('.lista-mini li');
                    if (detallesList.length >= 3) {
                        detallesList[0].textContent = `⏱️ ${receta.tiempo || receta.duracion_categoria}`;
                        detallesList[1].textContent = `👨‍🍳 ${receta.dificultad.charAt(0).toUpperCase() + receta.dificultad.slice(1)}`;

                        // IMPRIMIMOS LA NOTA MEDIA EXACTA EN LA TARJETA
                        detallesList[2].textContent = `⭐ ${receta.mediaRealCalculada}`;
                    }

                    const filaIconos = tarjetaDom.querySelector('.fila-iconos-receta');
                    if (filaIconos) {
                        filaIconos.innerHTML = '';
                        if (receta.alergenos && receta.alergenos.length > 0) {
                            receta.alergenos.slice(0, 5).forEach(alergeno => {
                                const imgAlergeno = document.createElement('img');
                                imgAlergeno.src = `img/${alergeno}.png`;
                                imgAlergeno.alt = alergeno;
                                imgAlergeno.title = alergeno.charAt(0).toUpperCase() + alergeno.slice(1);
                                imgAlergeno.className = 'icono-alergeno-mini';
                                filaIconos.appendChild(imgAlergeno);
                            });
                        }
                    }

                    const btnCorazon = tarjetaDom.querySelector('.btn-fav-receta');
                    if (btnCorazon) {
                        btnCorazon.dataset.id = receta.id;
                        if (misFavoritos.includes(receta.id)) {
                            btnCorazon.textContent = '🤎';
                        } else {
                            btnCorazon.textContent = '🤍';
                        }
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