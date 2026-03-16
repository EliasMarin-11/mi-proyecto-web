
let listaIngredientes = [];

document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en la página del buscador, ejecutamos la búsqueda
    if (window.location.pathname.toLowerCase().includes('buscador.html')) {
        ejecutarBusqueda(listaIngredientes);
    }
    // leer url y coger ingredientes del home
    const params = new URLSearchParams(window.location.search);
    const queryInicial = params.get('q');

    if (queryInicial) {
        listaIngredientes = queryInicial.split(',').filter(i => i.trim() !== '');

        // Si estamos en la página del buscador, ejecutamos la búsqueda
        if (window.location.pathname.toUpperCase().includes('BUSCADOR.html')) {
            ejecutarBusqueda(listaIngredientes);
        }

        setTimeout(actualizarTagsDOM, 500);
    }


    // listeners para los clicks
    document.addEventListener('click', (e) => {

        //botón "Filtros"
        if (e.target.closest('#btn-filtros')) {
            const menuFiltros = document.getElementById('menu-filtros');
            if (menuFiltros) menuFiltros.classList.toggle('oculto');
        }

        //botón "Buscar"
        if (e.target.closest('#btn-buscar')) {
            e.preventDefault();
            procesarBusqueda();
        }

        //"X" para borrar un ingrediente
        if (e.target.matches('.tag span')) {
            const index = e.target.getAttribute('data-index');
            listaIngredientes.splice(index, 1); // Lo borramos de la lista
            actualizarTagsDOM(); // Volvemos a pintar
        }

        // 4.clic fuera del menú de filtros, lo cerramos
        const menuFiltros = document.getElementById('menu-filtros');
        if (menuFiltros && !e.target.closest('#btn-filtros') && !e.target.closest('#menu-filtros')) {
            menuFiltros.classList.add('oculto');
        }
    });

    // teclado enter
    document.addEventListener('keypress', (e) => {
        if (e.target.id === 'input-ingrediente' && e.key === 'Enter') {
            e.preventDefault();
            const nuevoIngrediente = e.target.value.trim().toLowerCase();

            // Si escribió algo y no está repetido, se añade
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

    // 1. Si escribió algo pero olvidó darle a Enter antes de buscar, lo salvamos
    if (input) {
        const textoSuelto = input.value.trim().toLowerCase();
        if (textoSuelto && !listaIngredientes.includes(textoSuelto)) {
            listaIngredientes.push(textoSuelto);
            input.value = '';
        }
    }

    // 2. Comprobamos que haya ingredientes
    if (listaIngredientes.length === 0) {
        alert("¡Añade algún ingrediente primero!");
        return;
    }

    // 3. PRIMERO declaramos e inicializamos la variable 'query'
    const query = listaIngredientes.join(',');

    // 4. LUEGO la usamos (con el .toLowerCase() que arreglamos antes)
    if (window.location.pathname.toLowerCase().includes('buscador.html')) {
        window.history.pushState({}, '', `buscador.html?q=${query}`);
        ejecutarBusqueda(listaIngredientes);
    } else {
        window.location.href = `buscador.html?q=${query}`;
    }
}

function actualizarTagsDOM() {
    const contenedor = document.getElementById('contenedor-tags');
    if (!contenedor) return; // Si el HTML no ha cargado aún, no hacemos nada

    contenedor.innerHTML = '';
    listaIngredientes.forEach((ingrediente, index) => {
        const palabraLimpia = ingrediente.charAt(0).toUpperCase() + ingrediente.slice(1);
        contenedor.innerHTML += `<div class="tag">${palabraLimpia} <span data-index="${index}" title="Borrar" style="cursor:pointer; margin-left:5px;">✖</span></div>`;
    });
}

function ejecutarBusqueda(ingredientesBuscados) {
    console.log("🚀 1. Entrando en la función ejecutarBusqueda con:", ingredientesBuscados);

    const contenedorResultados = document.getElementById('resultados_lista');

    if (!contenedorResultados) {
        console.error("❌ 2. ERROR CRÍTICO: No he encontrado en tu HTML ningún elemento con id='resultados_lista'. ¡Revisa tu BUSCADOR.html!");
        return; // Aquí se muere la función si no encuentra el ID
    }

    console.log("✅ 3. Contenedor encontrado perfectamente. Procediendo a pedir el JSON...");

    // Limpiamos el contenedor
    contenedorResultados.innerHTML = '';

    Promise.all([
        fetch('data/db.json').then(res => res.json()),
        fetch('templates/tarjeta_receta_horizontal.html').then(res => res.text())
    ])
        .then(([data, templateString]) => {

            const checkboxesActivos = Array.from(document.querySelectorAll('.dropdown-bruto input[type="checkbox"]:checked')).map(cb => cb.value);

            // --- INICIO DEL NUEVO BLOQUE DE FILTRADO SEGURO ---

            // Función auxiliar: pasa a minúsculas y arranca las tildes de raíz
            const normalizar = (texto) => {
                if (!texto) return "";
                return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            };

            console.log("🔍 Buscando ingredientes:", ingredientesBuscados);

            const recetasFiltradas = data.recetas.filter(receta => {

                // 1. Búsqueda de Ingredientes (A prueba de tildes y errores de JSON)
        // 1. Búsqueda de Ingredientes (Lógica AND: la receta debe tener TODOS los ingredientes buscados)
                let coincideIngrediente = ingredientesBuscados.length === 0 || ingredientesBuscados.every(ingBuscado => {
                    const termino = normalizar(ingBuscado.trim());

                    const enTitulo = receta.titulo && normalizar(receta.titulo).includes(termino);

                    const enClave = Array.isArray(receta.ingredientes_clave) && receta.ingredientes_clave.some(ing =>
                        normalizar(ing).includes(termino)
                    );

                    const enNormal = Array.isArray(receta.ingredientes) && receta.ingredientes.some(ing =>
                        normalizar(ing).includes(termino)
                    );

                    return enTitulo || enClave || enNormal;
                });

                if (!coincideIngrediente) return false;

                // 2. Filtros Avanzados (Resolviendo el problema de "Fácil" vs "facil")
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

            console.log("✅ Recetas que sobrevivieron al filtro:", recetasFiltradas);

            // --- FIN DEL NUEVO BLOQUE DE FILTRADO SEGURO ---

            // 2. Usamos DOMParser como en tu main.js
            const parser = new DOMParser();
            const templateDoc = parser.parseFromString(templateString, 'text/html');
            const templateBase = templateDoc.body.firstElementChild;

            // 3. Montamos el DOM puramente
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
                        let descripcionCorta = receta.descripcion.length > 120 ? receta.descripcion.substring(0, 120) + '...' : receta.descripcion;
                        descEl.textContent = descripcionCorta;
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
        .catch(error => console.error("Error al buscar:", error));
}
