let listaIngredientes = [];

document.addEventListener('DOMContentLoaded', () => {

    if (window.location.pathname.toLowerCase().includes('favoritos.html')) {
        const usuarioJson = localStorage.getItem('usuarioLogueado');
        if (!usuarioJson) {
            window.location.href = 'index.html';
            return;
        }
        ejecutarVistaFavoritos(listaIngredientes);
    }

    document.addEventListener('click', (e) => {

        const btnCorazon = e.target.closest('.btn-fav-receta');
        if (btnCorazon) {
            e.preventDefault();
            e.stopPropagation();
            const idReceta = parseInt(btnCorazon.dataset.id);
            toggleFavorito(idReceta, btnCorazon);
            return;
        }

        if (e.target.closest('#btn-filtros')) {
            const menuFiltros = document.getElementById('menu-filtros');
            if (menuFiltros) menuFiltros.classList.toggle('oculto');
            return;
        }

        // --- LÓGICA DE BUSCAR Y APLICAR FILTROS ---
        if (e.target.closest('#btn-buscar') || e.target.closest('.btn-aplicar-filtros')) {
            e.preventDefault();
            procesarBusquedaLocal();

            // UX extra: Cerramos el menú al darle a aplicar para ver los resultados
            if (e.target.closest('.btn-aplicar-filtros')) {
                const menuFiltros = document.getElementById('menu-filtros');
                if (menuFiltros) menuFiltros.classList.add('oculto');
            }
            return;
        }

        if (e.target.matches('.tag span')) {
            const index = e.target.getAttribute('data-index');
            listaIngredientes.splice(index, 1);
            actualizarTagsDOM();
            ejecutarVistaFavoritos(listaIngredientes);
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
                ejecutarVistaFavoritos(listaIngredientes);
            }
            e.target.value = '';
        }
    });

    // ¡HEMOS ELIMINADO EL EVENTO 'CHANGE' PARA QUE NO FILTRE AUTOMÁTICAMENTE!
});

function toggleFavorito(idReceta, botonDom) {
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

        if (window.location.pathname.toLowerCase().includes('favoritos')) {
            const tarjetaEntera = botonDom.closest('.enlace-tarjeta');

            if (tarjetaEntera) {
                tarjetaEntera.remove();
            }

            if (usuario.favoritos.length === 0) {
                const contenedorResultados = document.getElementById('resultados_lista');
                if (contenedorResultados) {
                    contenedorResultados.innerHTML = '';
                    mostrarMensajeVacio(contenedorResultados, 'Aún no tienes recetas favoritas. ¡Ve al buscador y añade algunas!');
                }
            }
        }
    }

    localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
}

function procesarBusquedaLocal() {
    const input = document.getElementById('input-ingrediente');
    if (input) {
        const textoSuelto = input.value.trim().toLowerCase();
        if (textoSuelto && !listaIngredientes.includes(textoSuelto)) {
            listaIngredientes.push(textoSuelto);
            input.value = '';
            actualizarTagsDOM();
        }
    }
    ejecutarVistaFavoritos(listaIngredientes);
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

function ejecutarVistaFavoritos(ingredientesBuscados) {
    const contenedorResultados = document.getElementById('resultados_lista');
    if (!contenedorResultados) return;

    contenedorResultados.innerHTML = '';

    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));
    const misFavoritos = usuario.favoritos || [];

    if (misFavoritos.length === 0) {
        mostrarMensajeVacio(contenedorResultados, 'Aún no tienes recetas favoritas. ¡Ve al buscador y añade algunas!');
        return;
    }

    Promise.all([
        fetch('data/db.json').then(res => res.json()),
        fetch('templates/tarjeta_receta_horizontal.html').then(res => res.text())
    ])
        .then(([data, templateString]) => {

            // Solo lee los checkboxes cuando esta función es llamada por el botón "Aplicar"
            const checkboxesActivos = Array.from(document.querySelectorAll('.dropdown-bruto input[type="checkbox"]:checked')).map(cb => cb.value);

            const normalizar = (texto) => {
                if (!texto) return "";
                return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
            };

            const recetasFiltradas = data.recetas.filter(receta => {
                if (!misFavoritos.includes(receta.id)) return false;

                let coincideIngrediente = ingredientesBuscados.length === 0 || ingredientesBuscados.every(ingBuscado => {
                    const termino = normalizar(ingBuscado.trim());
                    const enTitulo = receta.titulo && normalizar(receta.titulo).includes(termino);
                    const enClave = Array.isArray(receta.ingredientes_clave) && receta.ingredientes_clave.some(ing => normalizar(ing).includes(termino));
                    const enNormal = Array.isArray(receta.ingredientes) && receta.ingredientes.some(ing => normalizar(ing).includes(termino));
                    return enTitulo || enClave || enNormal;
                });

                if (!coincideIngrediente) return false;

                if (checkboxesActivos.length > 0) {
                    const filtrosDificultad = checkboxesActivos.filter(val => ['facil', 'media', 'dificil'].includes(normalizar(val)));
                    if (filtrosDificultad.length > 0) {
                        if (!filtrosDificultad.includes(normalizar(receta.dificultad))) return false;
                    }

                    const filtrosDuracion = checkboxesActivos.filter(val => ['rapido', 'medio', 'lento'].includes(normalizar(val)));
                    if (filtrosDuracion.length > 0) {
                        let minReceta = 0;
                        const tiempoStr = normalizar(receta.tiempo || receta.duracion_categoria || "");
                        const numMatch = tiempoStr.match(/\d+/);
                        if (numMatch) {
                            minReceta = parseInt(numMatch[0]);
                            if (tiempoStr.includes('hora')) minReceta *= 60;
                        }
                        let encaja = false;
                        if (filtrosDuracion.includes('rapido') && minReceta <= 30) encaja = true;
                        if (filtrosDuracion.includes('medio') && minReceta > 30 && minReceta <= 60) encaja = true;
                        if (filtrosDuracion.includes('lento') && minReceta > 60) encaja = true;
                        if (!encaja) return false;
                    }

                    const filtrosPlato = checkboxesActivos.filter(val => ['primero', 'segundo', 'cuchara', 'postre'].includes(normalizar(val)));
                    if (filtrosPlato.length > 0) {
                        if (!filtrosPlato.includes(normalizar(receta.tipo_plato || ""))) return false;
                    }

                    const filtrosDieta = checkboxesActivos.filter(val => ['vegetariano', 'vegano', 'singluten', 'sinlactosa'].includes(normalizar(val)));
                    if (filtrosDieta.length > 0) {
                        for (let dietaReq of filtrosDieta) {
                            if ((dietaReq === 'vegetariano' || dietaReq === 'vegano') && (!Array.isArray(receta.dieta) || !receta.dieta.some(d => normalizar(d) === dietaReq))) return false;
                            if (dietaReq === 'singluten' && Array.isArray(receta.alergenos) && receta.alergenos.some(a => normalizar(a).includes('gluten'))) return false;
                            if (dietaReq === 'sinlactosa' && Array.isArray(receta.alergenos) && receta.alergenos.some(a => normalizar(a).includes('lacteo'))) return false;
                        }
                    }

                    const filtrosEstrellas = checkboxesActivos.filter(val => normalizar(val).includes('estrellas-'));
                    if (filtrosEstrellas.length > 0) {
                        let limite = 0;
                        filtrosEstrellas.forEach(f => {
                            const num = parseInt(f.replace('estrellas-', ''));
                            if (!isNaN(num) && num > limite) limite = num;
                        });
                        if ((receta.estrellas || 0) < limite) return false;
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

                    const tituloEl = tarjetaDom.querySelector('.receta-titulo') || tarjetaDom.querySelector('h3');
                    if (tituloEl) tituloEl.textContent = receta.titulo;

                    const contenedorImg = tarjetaDom.querySelector('.receta-dummy-img');
                    if (contenedorImg) {
                        const img = document.createElement('img');
                        img.src = receta.imagen;
                        img.alt = receta.titulo;
                        img.className = 'img-tarjeta-horizontal';
                        contenedorImg.replaceWith(img);
                    }

                    const descEl = tarjetaDom.querySelector('.detalles-desc p');
                    if (descEl) descEl.textContent = receta.descripcion.length > 120 ? receta.descripcion.substring(0, 120) + '...' : receta.descripcion;

                    const detallesList = tarjetaDom.querySelectorAll('.lista-mini li');
                    if (detallesList.length >= 3) {
                        detallesList[0].textContent = `⏱️ ${receta.tiempo || receta.duracion_categoria}`;
                        detallesList[1].textContent = `👨‍🍳 ${receta.dificultad}`;
                        detallesList[2].textContent = `⭐ ${receta.estrellas || 5}`;
                    }

                    const btnCorazon = tarjetaDom.querySelector('.btn-fav-receta');
                    if (btnCorazon) {
                        btnCorazon.dataset.id = receta.id;
                        btnCorazon.textContent = '🤎';
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

                    contenedorResultados.appendChild(tarjetaDom);
                });
            } else {
                mostrarMensajeVacio(contenedorResultados, 'Tus filtros son muy estrictos. No hay ninguna receta favorita que los cumpla.');
            }
        })
        .catch(error => console.error("Error renderizando favoritos:", error));
}

function mostrarMensajeVacio(contenedor, texto) {
    const div = document.createElement('div');
    div.className = 'mensaje-sin-resultados';

    const icono = document.createElement('div');
    icono.className = 'icono-vacio';
    icono.textContent = '🍽️';

    const titulo = document.createElement('h3');
    titulo.textContent = '¡Vaya! La nevera está vacía';

    const parrafo = document.createElement('p');
    parrafo.textContent = texto;

    div.appendChild(icono);
    div.appendChild(titulo);
    div.appendChild(parrafo);
    contenedor.appendChild(div);
}