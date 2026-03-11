// ==========================================
// CEREBRO DEL BUSCADOR Y FILTROS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    setTimeout(() => {
        const inputIngrediente = document.getElementById('input-ingrediente');
        const contenedorTags = document.getElementById('contenedor-tags');
        const btnBuscar = document.getElementById('btn-buscar');

        // Variables de Filtros
        const btnFiltros = document.getElementById('btn-filtros');
        const menuFiltros = document.getElementById('menu-filtros');

        let listaIngredientes = [];

        if (inputIngrediente && contenedorTags) {

            // --- 1. LÓGICA DE ABRIR/CERRAR FILTROS ---
            if (btnFiltros && menuFiltros) {
                btnFiltros.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menuFiltros.classList.toggle('oculto');
                });

                const btnAplicarFiltros = document.querySelector('.btn-aplicar-filtros');
                if (btnAplicarFiltros) {
                    btnAplicarFiltros.addEventListener('click', (e) => {
                        e.stopPropagation();
                        menuFiltros.classList.add('oculto');
                    });
                }

                document.addEventListener('click', (e) => {
                    if (!btnFiltros.contains(e.target) && !menuFiltros.contains(e.target)) {
                        menuFiltros.classList.add('oculto');
                    }
                });
            }

            // --- 2. LEER LA URL ---
            const params = new URLSearchParams(window.location.search);
            const queryInicial = params.get('q');

            if (queryInicial) {
                listaIngredientes = queryInicial.split(',').filter(i => i.trim() !== '');
                actualizarTagsDOM();
                if (window.location.pathname.toUpperCase().includes('BUSCADOR.html')) {
                    ejecutarBusqueda(listaIngredientes);
                }
            }

            // --- 3. AÑADIR TAGS AL PULSAR ENTER ---
            inputIngrediente.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const nuevoIngrediente = inputIngrediente.value.trim().toLowerCase();
                    if (nuevoIngrediente !== '' && !listaIngredientes.includes(nuevoIngrediente)) {
                        listaIngredientes.push(nuevoIngrediente);
                        actualizarTagsDOM();
                    }
                    inputIngrediente.value = '';
                }
            });

            // --- 4. FUNCIÓN PARA DIBUJAR LOS TAGS ---
            function actualizarTagsDOM() {
                contenedorTags.innerHTML = '';
                listaIngredientes.forEach((ingrediente, index) => {
                    const tag = document.createElement('div');
                    tag.className = 'tag';
                    const nombreVisible = ingrediente.charAt(0).toUpperCase() + ingrediente.slice(1);
                    tag.innerHTML = `${nombreVisible} <span data-index="${index}" title="Borrar">✖</span>`;
                    contenedorTags.appendChild(tag);
                });

                const botonesBorrar = contenedorTags.querySelectorAll('.tag span');
                botonesBorrar.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const indexABorrar = e.target.getAttribute('data-index');
                        listaIngredientes.splice(indexABorrar, 1);
                        actualizarTagsDOM();
                    });
                });
            }

            // --- 5. EL BOTÓN "BUSCAR" ---
            if (btnBuscar) {
                btnBuscar.addEventListener('click', (e) => {
                    e.preventDefault();

                    const textoSuelto = inputIngrediente.value.trim().toLowerCase();
                    if (textoSuelto !== '' && !listaIngredientes.includes(textoSuelto)) {
                        listaIngredientes.push(textoSuelto);
                        actualizarTagsDOM();
                        inputIngrediente.value = '';
                    }

                    if (listaIngredientes.length === 0) {
                        alert("¡Añade algún ingrediente primero!");
                        return;
                    }

                    const query = listaIngredientes.join(',');
                    const currentPath = window.location.pathname.toUpperCase();

                    if (currentPath.includes('BUSCADOR.html')) {
                        window.history.pushState({}, '', `BUSCADOR.html?q=${query}`);
                        ejecutarBusqueda(listaIngredientes);
                    } else {
                        window.location.href = `BUSCADOR.html?q=${query}`;
                    }
                });
            }
        }
    }, 300);

    // --- 6. FUNCIÓN QUE FILTRA Y PINTA RESULTADOS (ACTUALIZADA CON FILTROS AVANZADOS) ---
    function ejecutarBusqueda(ingredientesBuscados) {
        const contenedorResultados = document.getElementById('resultados_lista');
        if (!contenedorResultados) return;

        contenedorResultados.innerHTML = '<h2 class="titulo_centrado">Buscando en la nevera...</h2>';

        fetch('data/db.json')
            .then(res => res.json())
            .then(data => {

                // Recogemos los checkboxes marcados
                const checkboxesActivos = Array.from(document.querySelectorAll('.dropdown-bruto input[type="checkbox"]:checked')).map(cb => cb.value);

                const recetasFiltradas = data.recetas.filter(receta => {

                    // 1. Filtro de Ingredientes (Busca en receta.ingredientes_clave)
                    let coincideIngrediente = false;
                    if (ingredientesBuscados.length === 0) {
                        coincideIngrediente = true;
                    } else {
                        coincideIngrediente = ingredientesBuscados.some(ingBuscado => {
                            return receta.ingredientes_clave.some(ingClave => ingClave.includes(ingBuscado));
                        });
                    }

                    if (!coincideIngrediente) return false;

                    // 2. Filtros de Checkboxes
                    if (checkboxesActivos.length > 0) {
                        const filtrosDificultad = checkboxesActivos.filter(val => ['facil', 'media', 'dificil'].includes(val));
                        if (filtrosDificultad.length > 0 && !filtrosDificultad.includes(receta.dificultad)) return false;

                        const filtrosDuracion = checkboxesActivos.filter(val => ['rapido', 'medio', 'lento'].includes(val));
                        if (filtrosDuracion.length > 0 && !filtrosDuracion.includes(receta.duracion_categoria)) return false;

                        const filtrosTipo = checkboxesActivos.filter(val => ['primero', 'segundo', 'cuchara', 'postre'].includes(val));
                        if (filtrosTipo.length > 0 && !filtrosTipo.includes(receta.tipo_plato)) return false;

                        const filtrosDieta = checkboxesActivos.filter(val => ['singluten', 'sinlactosa', 'vegetariano', 'vegano'].includes(val));
                        if (filtrosDieta.length > 0) {
                            const cumpleDieta = filtrosDieta.every(dietaReq => receta.dieta.includes(dietaReq));
                            if (!cumpleDieta) return false;
                        }

                        const filtrosEstrellas = checkboxesActivos.filter(val => val.startsWith('estrellas-'));
                        if (filtrosEstrellas.length > 0) {
                            const estrellasRequeridas = parseInt(filtrosEstrellas[0].split('-')[1]);
                            if (receta.estrellas < estrellasRequeridas) return false;
                        }
                    }
                    return true;
                });

                contenedorResultados.innerHTML = '';

                if (recetasFiltradas.length > 0) {
                    recetasFiltradas.forEach(receta => {
                        const tarjetaHTML = `
                            <a href="${receta.enlace}" class="enlace_tarjeta" style="text-decoration: none;">
                                <article class="tarjeta-h" style="display:flex; border:4px solid #4E1A0A; border-radius:20px; overflow:hidden; box-shadow: 8px 8px 0px rgba(78,26,10,0.2); background:#fff; margin-bottom: 30px;">
                                    <div style="width: 320px; flex-shrink: 0;">
                                        <img src="${receta.imagen}" alt="${receta.titulo}" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                    <div style="padding: 30px; display:flex; flex-direction:column; justify-content:center;">
                                        <h2 style="margin:0 0 15px 0; color:#4E1A0A; font-size: 26px;">${receta.titulo}</h2>
                                        <p style="margin:0 0 10px 0; font-weight:bold; color:#4E1A0A; font-size: 16px;">⏱️ ${receta.tiempo} | 👨‍🍳 ${receta.dificultad.charAt(0).toUpperCase() + receta.dificultad.slice(1)} | ⭐ ${receta.estrellas}</p>
                                    </div>
                                </article>
                            </a>
                        `;
                        contenedorResultados.innerHTML += tarjetaHTML;
                    });
                } else {
                    contenedorResultados.innerHTML = `
                        <div class="mensaje-sin-resultados">
                            <div class="icono-ups">🍽️</div>
                            <h3>¡Vaya! La nevera está vacía</h3>
                            <p>No hemos encontrado recetas con esos ingredientes o filtros. Prueba a cambiarlos.</p>
                        </div>
                    `;
                }
            })
            .catch(error => console.error("Error al buscar:", error));
    }
});