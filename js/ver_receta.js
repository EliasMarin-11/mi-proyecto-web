let puntuacionActual = 5;
let reseñasActuales = [];
let recetaIdGlobal = null;

document.addEventListener('DOMContentLoaded', () => {
    const parametros = new URLSearchParams(window.location.search);
    recetaIdGlobal = parseInt(parametros.get('id'));

    function inicializarReseñas() {
        const contenedorReseñas = document.getElementById('lista-reseñas');
        if (contenedorReseñas && recetaIdGlobal) {
            cargarReseñasDeReceta(contenedorReseñas);
            configurarEstrellasInteractivas();
        } else if (!recetaIdGlobal) {
            // Sin ID, no hacemos nada
        } else {
            setTimeout(inicializarReseñas, 50);
        }
    }

    inicializarReseñas();

    document.addEventListener('click', (e) => {
        if (e.target.matches('.btn-trash-icon')) {
            const idReseña = e.target.getAttribute('data-id');
            borrarMiReseña(idReseña);
        }
    });
});

function configurarEstrellasInteractivas() {
    const estrellas = document.querySelectorAll('.estrella-click');
    if (estrellas.length === 0) return;

    actualizarPintadoEstrellas(estrellas, puntuacionActual);

    estrellas.forEach(estrella => {
        estrella.addEventListener('click', (e) => {
            puntuacionActual = parseInt(e.target.getAttribute('data-valor'));
            actualizarPintadoEstrellas(estrellas, puntuacionActual);
        });
    });
}

function actualizarPintadoEstrellas(estrellas, valorLimite) {
    estrellas.forEach((est, index) => {
        if (index < valorLimite) {
            est.classList.add('activa');
        } else {
            est.classList.remove('activa');
        }
    });
}

function cargarReseñasDeReceta(contenedorReseñas) {
    fetch('data/db.json')
        .then(respuesta => respuesta.json())
        .then(datos => {
            const receta = datos.recetas.find(r => r.id === recetaIdGlobal);
            contenedorReseñas.innerHTML = '';

            const localesStr = localStorage.getItem('reseñasLocales');
            const localesObj = localesStr ? JSON.parse(localesStr) : {};
            const misLocales = localesObj[recetaIdGlobal] || [];

            const jsonReseñas = (receta && receta.reseñas) ? receta.reseñas : [];

            reseñasActuales = [...jsonReseñas, ...misLocales];

            if (reseñasActuales.length === 0) {
                mostrarMensajeSinReseñas(contenedorReseñas);
            } else {
                reseñasActuales.forEach(res => {
                    const esMia = misLocales.some(m => m.id === res.id);
                    construirNodoReseña(res, contenedorReseñas, esMia);
                });
            }

            actualizarMediaDOM();
            gestionarCajaReseña(contenedorReseñas); // Llamamos aquí para saber si ya comentó
        })
        .catch(error => console.error("Error al cargar las reseñas:", error));
}

function actualizarMediaDOM() {
    // Añadimos el ID de la cabecera (#receta-estrellas-hero) para que se actualice en vivo
    const itemsListaDetalle = document.querySelectorAll('.lista-mini li, .lista-info-breve li, #receta-estrellas-hero');

    if (reseñasActuales.length === 0) {
        itemsListaDetalle.forEach(li => {
            if (li.textContent.includes('⭐') || li.id === 'receta-estrellas-hero') {
                li.textContent = `⭐ Sin valoraciones`;
            }
        });
        return;
    }

    let sumaTotal = 0;
    reseñasActuales.forEach(res => {
        sumaTotal += res.puntuacion;
    });

    const media = parseFloat((sumaTotal / reseñasActuales.length).toFixed(1));

    itemsListaDetalle.forEach(li => {
        if (li.textContent.includes('⭐') || li.id === 'receta-estrellas-hero') {
            li.textContent = `⭐ ${media} (${reseñasActuales.length} opiniones)`;
        }
    });
}

function construirNodoReseña(datosReseña, contenedor, esNueva = false) {
    const divItem = document.createElement('div');
    divItem.className = 'reseña-item';
    if (esNueva) {
        divItem.classList.add('user-post-item');
        divItem.id = datosReseña.id;
    }

    const divAvatar = document.createElement('div');
    divAvatar.className = 'usuario-avatar-reseña';
    const imgAvatar = document.createElement('img');
    imgAvatar.src = datosReseña.avatar || "img/Usuario SINFONDO.png";
    imgAvatar.alt = datosReseña.usuario;
    divAvatar.appendChild(imgAvatar);

    const divCuerpo = document.createElement('div');
    divCuerpo.className = 'cuerpo-reseña';

    const h4Nombre = document.createElement('h4');
    h4Nombre.className = 'nombre-usuario-reseña';
    h4Nombre.textContent = datosReseña.usuario;

    const pTexto = document.createElement('p');
    if (datosReseña.texto !== "") {
        const pTexto = document.createElement('p');
        pTexto.className = 'texto-reseña';
        pTexto.textContent = datosReseña.texto;
        divCuerpo.appendChild(pTexto);
    }

    const divFooter = document.createElement('div');
    divFooter.className = 'footer-reseña';

    const puntos = datosReseña.puntuacion || 5;
    const divEstrellas = document.createElement('div');
    divEstrellas.className = 'selector-estrellas';
    divEstrellas.textContent = "⭐".repeat(puntos);
    divFooter.appendChild(divEstrellas);

    divCuerpo.appendChild(h4Nombre);
    divCuerpo.appendChild(pTexto);
    divCuerpo.appendChild(divFooter);

    divItem.appendChild(divAvatar);
    divItem.appendChild(divCuerpo);

    if (esNueva) {
        const btnBorrar = document.createElement('button');
        btnBorrar.className = 'btn-trash-icon';
        btnBorrar.setAttribute('data-id', datosReseña.id);
        btnBorrar.textContent = '🗑️';
        divItem.appendChild(btnBorrar);
    }

    if (esNueva) {
        contenedor.prepend(divItem);
    } else {
        contenedor.appendChild(divItem);
    }
}

function mostrarMensajeSinReseñas(contenedor) {
    const divVacio = document.createElement('div');
    divVacio.className = 'caja-sin-resenas';

    const pVacio = document.createElement('p');
    pVacio.textContent = 'Todavía no hay reseñas. ¡Sé el primero en opinar! 🍳';

    divVacio.appendChild(pVacio);
    contenedor.appendChild(divVacio);
}

function gestionarCajaReseña(contenedorReseñas) {
    const usuarioJson = localStorage.getItem('usuarioLogueado');
    const cajaEscribir = document.getElementById('caja-mi-reseña');
    const avatarEscribir = document.getElementById('avatar-escribir');
    const textarea = document.getElementById('texto-nueva-reseña');
    const btnPublicar = document.getElementById('btn-publicar-reseña');
    const contenedorEstrellas = document.getElementById('selector-puntuacion');

    if (!cajaEscribir) return;

    if (usuarioJson) {
        const usuario = JSON.parse(usuarioJson);

        const yaComento = reseñasActuales.some(r => r.usuario === usuario.nombre);

        if (yaComento) {
            cajaEscribir.style.display = 'none';
            return;
        } else {
            cajaEscribir.style.display = '';
        }

        if (avatarEscribir) {
            avatarEscribir.src = usuario.foto || "img/Usuario SINFONDO.png";
            avatarEscribir.classList.remove('avatar-inactivo');
        }

        cajaEscribir.classList.remove('boton-bloqueado');
        if (contenedorEstrellas) contenedorEstrellas.style.display = 'flex';

        if (textarea) {
            textarea.disabled = false;
            // Cambiamos el placeholder para que quede claro que es opcional
            textarea.placeholder = `Añade un comentario (opcional), ${usuario.nombre}...`;
        }

        if (btnPublicar) {
            btnPublicar.textContent = "Publicar Valoración";

            const manejadorPublicar = (e) => {
                e.preventDefault();
                const texto = textarea.value.trim();

                // ¡HEMOS QUITADO LA ALERTA DE TEXTO OBLIGATORIO!

                const mensajeVacio = document.querySelector('.caja-sin-resenas');
                if (mensajeVacio) {
                    mensajeVacio.remove();
                }

                const nuevaResenaDatos = {
                    id: 'reseña-' + Date.now(),
                    usuario: usuario.nombre,
                    avatar: usuario.foto,
                    texto: texto, // Guardará el texto o un string vacío ""
                    puntuacion: puntuacionActual
                };

                const localesStr = localStorage.getItem('reseñasLocales');
                const localesObj = localesStr ? JSON.parse(localesStr) : {};
                if (!localesObj[recetaIdGlobal]) localesObj[recetaIdGlobal] = [];
                localesObj[recetaIdGlobal].push(nuevaResenaDatos);
                localStorage.setItem('reseñasLocales', JSON.stringify(localesObj));

                reseñasActuales.push(nuevaResenaDatos);
                construirNodoReseña(nuevaResenaDatos, contenedorReseñas, true);

                actualizarMediaDOM();
                gestionarCajaReseña(contenedorReseñas);

                textarea.value = '';
                puntuacionActual = 5;
                actualizarPintadoEstrellas(document.querySelectorAll('.estrella-click'), 5);
            };

            btnPublicar.removeEventListener('click', btnPublicar.manejadorActual);
            btnPublicar.addEventListener('click', manejadorPublicar);
            btnPublicar.manejadorActual = manejadorPublicar;
        }

    } else {
        cajaEscribir.classList.add('boton-bloqueado');
        if (contenedorEstrellas) contenedorEstrellas.style.display = 'none';

        if (textarea) {
            textarea.disabled = true;
            textarea.placeholder = "🔒 Inicia sesión para opinar...";
        }

        if (btnPublicar) {
            btnPublicar.textContent = "Iniciar Sesión";
            btnPublicar.onclick = () => { window.location.href = "index.html"; };
        }

        if (avatarEscribir) {
            avatarEscribir.classList.add('avatar-inactivo');
        }
    }
}

function borrarMiReseña(idReseña) {
    const reseñaABorrar = document.getElementById(idReseña);
    if (reseñaABorrar) {
        if (confirm("¿Seguro que quieres borrar tu opinión?")) {

            reseñaABorrar.remove();

            const localesStr = localStorage.getItem('reseñasLocales');
            if (localesStr) {
                const localesObj = JSON.parse(localesStr);
                if (localesObj[recetaIdGlobal]) {
                    localesObj[recetaIdGlobal] = localesObj[recetaIdGlobal].filter(r => r.id !== idReseña);
                    localStorage.setItem('reseñasLocales', JSON.stringify(localesObj));
                }
            }

            reseñasActuales = reseñasActuales.filter(r => r.id !== idReseña);

            actualizarMediaDOM();

            // ¡Al borrar, volvemos a llamar a gestionarCajaReseña para que reaparezca el formulario!
            const contenedorReseñas = document.getElementById('lista-reseñas');
            gestionarCajaReseña(contenedorReseñas);

            if (contenedorReseñas && contenedorReseñas.children.length === 0) {
                mostrarMensajeSinReseñas(contenedorReseñas);
            }
        }
    }
}