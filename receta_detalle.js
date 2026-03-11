// ==========================================
// TAREA 4: CARGAR Y PINTAR RESEÑAS
// ==========================================

async function cargarReseñasDeReceta() {
    // 1. Pillamos el ID de la receta desde la URL (ej: ?id=1)
    const parametros = new URLSearchParams(window.location.search);
    const recetaId = parseInt(parametros.get('id'));

    // Si por lo que sea no hay ID en la URL, paramos aquí
    if (!recetaId) return;

    try {
        // 2. Llamamos a tu base de datos simulada
        const respuesta = await fetch('/data/db.json');
        const datos = await respuesta.json();

        // 3. Buscamos la receta que coincide con el ID
        const receta = datos.recetas.find(r => r.id === recetaId);
        const contenedorReseñas = document.getElementById('lista-reseñas');

        // CHIVATOS PARA LA CONSOLA:
        console.log("1. Receta encontrada:", receta);
        console.log("2. Contenedor encontrado:", contenedorReseñas);

        if (!receta) {
            console.error("❌ ERROR: No encuentro la receta con ID " + recetaId + " en el db.json");
            return;
        }
        if (!contenedorReseñas) {
            console.error("❌ ERROR: No encuentro el div 'lista-reseñas' en el HTML. ¡Alguien lo ha borrado!");
            return;
        }
        // Limpiamos por si acaso
        contenedorReseñas.innerHTML = '';

        // 4. ¿Qué pasa si no hay reseñas (como en la Ensalada César)?
        if (!receta.reseñas || receta.reseñas.length === 0) {
            contenedorReseñas.innerHTML = `
                <div style="text-align: center; padding: 30px; border: 4px dashed var(--marron-boton); border-radius: 20px; background-color: var(--fondo-crema);">
                    <p style="font-size: 18px; font-weight: bold; color: var(--marron-boton);">
                        Todavía no hay reseñas. ¡Sé el primero en opinar! 🍳
                    </p>
                </div>
            `;
            return;
        }

        // 5. Si hay reseñas, las pintamos una a una
        receta.reseñas.forEach(res => {
            // Repetimos la estrella tantas veces como puntuación tenga (ej: 4 = ⭐⭐⭐⭐)
            const estrellasHTML = "⭐".repeat(res.puntuacion);

            const reseñaHTML = `
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

            // Vamos sumando cada bloque HTML al contenedor principal
            contenedorReseñas.innerHTML += reseñaHTML;
        });

    } catch (error) {
        console.error("Error al cargar las reseñas:", error);
    }
}
// ==========================================
// TAREA 5: CONTROL DE SESIÓN EN RESEÑAS
// ==========================================

function gestionarCajaReseña() {
    const usuarioJson = localStorage.getItem('usuarioLogueado');
    const cajaEscribir = document.getElementById('caja-mi-reseña');
    const avatarEscribir = document.getElementById('avatar-escribir');
    const textarea = document.getElementById('texto-nueva-reseña');
    const btnPublicar = document.getElementById('btn-publicar-reseña');
    const contenedorReseñas = document.getElementById('lista-reseñas');

    if (!cajaEscribir) return;

    if (usuarioJson) {
        // --- CASO A: LOGUEADO (María) ---
        const usuario = JSON.parse(usuarioJson);

        if (avatarEscribir) avatarEscribir.src = usuario.foto || "img/Usuario SINFONDO.png";

        cajaEscribir.classList.remove('boton-bloqueado');
        if (textarea) {
            textarea.disabled = false;
            // Un placeholder más corto para la franja horizontal
            textarea.placeholder = `Opina, ${usuario.nombre}...`;
        }

        // Configuramos el botón para PUBLICAR
        if (btnPublicar) {
            btnPublicar.innerText = "Publicar";
            // Quitamos onclicks previos por seguridad
            btnPublicar.onclick = null;

            btnPublicar.onclick = () => {
                const texto = textarea.value.trim();

                if (texto === "") {
                    alert("¡Escribe algo antes de publicar, " + usuario.nombre + "!");
                    return;
                }

                // Generamos un ID único para poder borrar esta reseña específica
                const idUnico = 'reseña-' + Date.now();

                // 1. Creamos la tarjeta HTML con la nueva reseña LARGA, con el texto debajo del nombre y el CUBO DE BASURA
                // Usamos la clase user-post-item para el borde coral
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
                        <button class="btn-trash-icon" onclick="borrarMiReseña('${idUnico}')">🗑️</button>
                    </div>
                `;

                // 2. Si estaba el mensaje de "Todavía no hay reseñas", lo borramos
                if (contenedorReseñas.innerHTML.includes('Todavía no hay reseñas')) {
                    contenedorReseñas.innerHTML = '';
                }

                // 3. Metemos la nueva reseña arriba del todo
                contenedorReseñas.insertAdjacentHTML('afterbegin', nuevaReseñaHTML);

                // 4. Vaciamos la caja para que quede limpia
                textarea.value = '';
            };
        }

    } else {
        // --- CASO B: INVITADO ---
        cajaEscribir.classList.add('boton-bloqueado');
        if (textarea) {
            textarea.disabled = true;
            textarea.placeholder = "🔒 Inicia sesión para opinar...";
        }
        if (btnPublicar) {
            btnPublicar.innerText = "Iniciar Sesión";
            btnPublicar.onclick = null;
            btnPublicar.onclick = () => { window.location.href = "LOGIN.html"; };
        }
        if (avatarEscribir) avatarEscribir.style.opacity = "0.3";
    }
}

// ==========================================
// FUNCIÓN GLOBAL PARA BORRAR TU RESEÑA
// ==========================================
function borrarMiReseña(idReseña) {
    // Buscamos la tarjeta por su ID único
    const reseñaABorrar = document.getElementById(idReseña);

    // Si existe, la eliminamos del HTML
    if (reseñaABorrar) {
        if (confirm("¿Seguro que quieres borrar tu opinión?")) {
            reseñaABorrar.remove();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        cargarReseñasDeReceta();
        gestionarCajaReseña();
    }, 100); // Le damos casi un segundo para que todo el HTML esté listo
});