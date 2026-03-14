
let listaIngredientes = [];

document.addEventListener('DOMContentLoaded', () => {

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

    //Si escribió algo pero olvidó darle a Enter antes de buscar, lo salvamos
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

    if (window.location.pathname.toUpperCase().includes('BUSCADOR.html')) {
        window.history.pushState({}, '', `BUSCADOR.html?q=${query}`);
        ejecutarBusqueda(listaIngredientes);
    } else {
        window.location.href = `BUSCADOR.html?q=${query}`;
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
    const contenedorResultados = document.getElementById('resultados_lista');
    if (!contenedorResultados) return;

    contenedorResultados.innerHTML = '<h2 class="titulo_centrado">Buscando en la nevera... 🍳</h2>';

    // Pedimos al servidor el JSON y tu molde HTML a la vez
    Promise.all([
        fetch('data/db.json').then(res => res.json()),
        fetch('templates/tarjeta_receta_horizontal.html').then(res => res.text())
    ])
        .then(([data, templateHTML]) => {

            // miramos filtros
            const checkboxesActivos = Array.from(document.querySelectorAll('.dropdown-bruto input[type="checkbox"]:checked')).map(cb => cb.value);

            // filtramos
            const recetasFiltradas = data.recetas.filter(receta => {

                // coincidencias
                let coincideIngrediente = ingredientesBuscados.length === 0 || ingredientesBuscados.some(ingBuscado => {
                    return receta.ingredientes_clave.some(ingClave => ingClave.includes(ingBuscado));
                });
                if (!coincideIngrediente) return false;

                // Filtros Avanzados
                if (checkboxesActivos.length > 0) {
                    const filtrosDificultad = checkboxesActivos.filter(val => ['facil', 'media', 'dificil'].includes(val));
                    if (filtrosDificultad.length > 0 && !filtrosDificultad.includes(receta.dificultad)) return false;

                    const filtrosDieta = checkboxesActivos.filter(val => ['singluten', 'sinlactosa', 'vegetariano', 'vegano'].includes(val));
                    if (filtrosDieta.length > 0) {
                        const cumpleDieta = filtrosDieta.every(dietaReq => receta.dieta.includes(dietaReq));
                        if (!cumpleDieta) return false; // Si falta alguna dieta, se descarta
                    }
                }
                return true;
            });

            // monatmos las recetas q pasan los filtros
            if (recetasFiltradas.length > 0) {
                let htmlAcumulado = '';

                recetasFiltradas.forEach(receta => {
                    let descripcionCorta = receta.descripcion.length > 120 ? receta.descripcion.substring(0, 120) + '...' : receta.descripcion;

                    let tarjetaRellena = templateHTML
                        .replace('LOREM IPSUM RECETA TITULO', receta.titulo)
                        .replace('detalle_receta.html', receta.enlace)
                        .replace('<div class="receta-dummy-img"></div>', `<img src="${receta.imagen}" alt="${receta.titulo}" class="img-receta-detalle">`)
                        .replace('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', descripcionCorta)
                        .replace('<li>loremipsun</li>', `<li>⏱️ ${receta.tiempo}</li>`)
                        .replace('<li>loremipsun</li>', `<li>👨‍🍳 ${receta.dificultad.charAt(0).toUpperCase() + receta.dificultad.slice(1)}</li>`)
                        .replace('<li>loremipsun</li>', `<li>⭐ ${receta.estrellas}</li>`);

                    htmlAcumulado += tarjetaRellena;
                });

                contenedorResultados.innerHTML = htmlAcumulado;

            } else {
                contenedorResultados.innerHTML = `
                <div class="mensaje-sin-resultados" style="text-align:center; padding: 50px;">
                    <div style="font-size: 50px;">🍽️</div>
                    <h3>¡Vaya! La nevera está vacía</h3>
                    <p>No hemos encontrado recetas con lo que nos pides. Prueba a quitar algún filtro.</p>
                </div>
            `;
            }
        })
        .catch(error => console.error("Error al buscar:", error));
}