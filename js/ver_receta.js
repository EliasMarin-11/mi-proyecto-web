//reseñas y comentarios

document.addEventListener('DOMContentLoaded', () => {

    //esperamos a que el template de la receta cargue
    function esperarSeccionReseñas() {
        const contenedorReseñas = document.getElementById('lista-reseñas');

        if (contenedorReseñas) {
            // Cuando exista, cargamos los datos
            cargarReseñasDeReceta();
            gestionarCajaReseña();
        } else {
            // Si no, esperamos 50ms y volvemos a mirar
            setTimeout(esperarSeccionReseñas, 50);
        }
    }

    esperarSeccionReseñas();

    //listener botón de "Borrar Reseña"
    document.addEventListener('click', (e) => {
        // Buscamos si han hecho clic en el botón de la papelera
        if (e.target && e.target.classList.contains('btn-trash-icon')) {
            const idReseña = e.target.getAttribute('data-id');
            borrarMiReseña(idReseña);
        }
    });
});


//montar reseña
async function cargarReseñasDeReceta() {
    const parametros = new URLSearchParams(window.location.search);
    const recetaId = parseInt(parametros.get('id'));

    if (!recetaId) return;

    try {
        const respuesta = await fetch('data/db.json');
        const datos = await respuesta.json();

        const receta = datos.recetas.find(r => r.id === recetaId);
        const contenedorReseñas = document.getElementById('lista-reseñas');

        if (!receta || !contenedorReseñas) return;

        //Si NO hay reseñas
        if (!receta.reseñas || receta.reseñas.length === 0) {
            contenedorReseñas.innerHTML = `
                <div class="caja-sin-resenas">
                    <p>Todavía no hay reseñas. ¡Sé el primero en opinar! 🍳</p>
                </div>
            `;
            return;
        }

        //si hay reseñas
        let htmlAcumulado = '';

        receta.reseñas.forEach(res => {
            const estrellasHTML = "⭐".repeat(res.puntuacion);

            htmlAcumulado += `
                <div class="reseña-item">
                    <div class="usuario-avatar-reseña">
                        <img src="${res.avatar}" alt="${res.usuario}">
                    </div>
                    <div class="cuerpo-reseña">
                        <h4 class="nombre-usuario-reseña">${res.usuario}</h4>
                        <p class="texto-reseña">${res.texto}</p>
                        <div class="footer-reseña">
                            <div class="selector-estrellas">${estrellasHTML}</div>
                        </div>
                    </div>
                </div>
            `;
        });

        contenedorReseñas.innerHTML = htmlAcumulado;

    } catch (error) {
        console.error("Error al cargar las reseñas:", error);
    }
}

function gestionarCajaReseña() {
    const usuarioJson = localStorage.getItem('usuarioLogueado');
    const cajaEscribir = document.getElementById('caja-mi-reseña');
    const avatarEscribir = document.getElementById('avatar-escribir');
    const textarea = document.getElementById('texto-nueva-reseña');
    const btnPublicar = document.getElementById('btn-publicar-reseña');
    const contenedorReseñas = document.getElementById('lista-reseñas');

    if (!cajaEscribir) return;

    if (usuarioJson) {
        //logueado
        const usuario = JSON.parse(usuarioJson);

        if (avatarEscribir) {
            avatarEscribir.src = usuario.foto || "img/Usuario SINFONDO.png";
            avatarEscribir.classList.remove('avatar-inactivo');
        }

        cajaEscribir.classList.remove('boton-bloqueado');

        if (textarea) {
            textarea.disabled = false;
            textarea.placeholder = `Opina, ${usuario.nombre}...`;
        }

        if (btnPublicar) {
            btnPublicar.innerText = "Publicar";
            btnPublicar.onclick = null;

            btnPublicar.onclick = () => {
                const texto = textarea.value.trim();

                if (texto === "") {
                    alert(`¡Escribe algo antes de publicar, ${usuario.nombre}!`);
                    return;
                }

                const idUnico = 'reseña-' + Date.now();

                const nuevaReseñaHTML = `
                    <div class="reseña-item user-post-item" id="${idUnico}">
                        <div class="usuario-avatar-reseña">
                            <img src="${usuario.foto || 'img/Usuario SINFONDO.png'}" alt="${usuario.nombre}">
                        </div>
                        <div class="cuerpo-reseña">
                            <h4 class="nombre-usuario-reseña">${usuario.nombre}</h4>
                            <p class="texto-reseña">${texto}</p>
                            <div class="footer-reseña"></div>
                        </div>
                        <button class="btn-trash-icon" data-id="${idUnico}">🗑️</button>
                    </div>
                `;

                if (document.querySelector('.caja-sin-resenas')) {
                    contenedorReseñas.innerHTML = '';
                }

                // Metemos la nueva reseña al principio
                contenedorReseñas.insertAdjacentHTML('afterbegin', nuevaReseñaHTML);
                textarea.value = '';
            };
        }

    } else {
        // no logueado
        cajaEscribir.classList.add('boton-bloqueado');

        if (textarea) {
            textarea.disabled = true;
            textarea.placeholder = "🔒 Inicia sesión para opinar...";
        }

        if (btnPublicar) {
            btnPublicar.innerText = "Iniciar Sesión";
            btnPublicar.onclick = () => { window.location.href = "LOGIN.html"; };
        }

        if (avatarEscribir) {
            avatarEscribir.classList.add('avatar-inactivo'); //CSS
        }
    }
}

//borrar reseña
function borrarMiReseña(idReseña) {
    const reseñaABorrar = document.getElementById(idReseña);
    if (reseñaABorrar) {
        if (confirm("¿Seguro que quieres borrar tu opinión?")) {
            reseñaABorrar.remove();
        }
    }
}