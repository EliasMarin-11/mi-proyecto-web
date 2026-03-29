document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('click', (e) => {
        // Cerrar sesión
        if (e.target && e.target.id === 'btn-logout') {
            e.preventDefault();
            localStorage.removeItem('usuarioLogueado');
            window.location.href = "index.html";
        }

        // --- VALIDACIÓN PREMIUM PARA CREAR RECETAS ---
        if (e.target && e.target.id === 'btn-ir-nueva-receta') {
            const usuarioJson = localStorage.getItem('usuarioLogueado');
            if (usuarioJson) {
                const usuario = JSON.parse(usuarioJson);
                // Comprobamos si es premium
                if (usuario.rol === 'premium' || usuario.premium === true) {
                    window.location.href = 'SUBIR_RECETA.html';
                } else {
                    alert('¡Ups! 🔒 Crear recetas es una función exclusiva para usuarios Premium. Mejora tu plan para compartir tus platos con el mundo.');
                    window.location.href = 'SUSCRIPCION.html';
                }
            }
        }
    });

    let intentosPerfil = 0;

    function intentarCargarPerfil() {
        const textoNombre = document.querySelector('.perfil-nombre');

        if (textoNombre) {
            const usuarioJson = localStorage.getItem('usuarioLogueado');
            if (!usuarioJson) return;

            const usuario = JSON.parse(usuarioJson);
            textoNombre.textContent = usuario.nombre;

            const inputEmail = document.querySelector('.perfil-formulario input[type="email"]');
            if (inputEmail) inputEmail.value = usuario.email;

            const avatarImg = document.querySelector('.perfil-avatar');
            const inputAvatar = document.querySelector('#input-avatar') || document.querySelector('input[type="file"]');

            if (avatarImg && inputAvatar) {
                if (usuario.foto) avatarImg.src = usuario.foto;

                avatarImg.style.cursor = 'pointer';
                avatarImg.addEventListener('click', () => inputAvatar.click());

                inputAvatar.addEventListener('change', (e) => {
                    const archivo = e.target.files[0];
                    if (archivo && archivo.type.startsWith('image/')) {
                        const lector = new FileReader();
                        lector.onload = (evento) => {
                            const base64 = evento.target.result;
                            avatarImg.src = base64;
                            usuario.foto = base64;
                            localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
                            gestionarSesion();
                        };
                        lector.readAsDataURL(archivo);
                    }
                });
            }

            const btnEditarNombre = document.getElementById('btn-editar-nombre');
            if (btnEditarNombre) {
                btnEditarNombre.addEventListener('click', () => {
                    const nuevoNombre = prompt("Introduce tu nuevo nombre para mostrar:", usuario.nombre);
                    if (nuevoNombre !== null && nuevoNombre.trim() !== "") {
                        usuario.nombre = nuevoNombre.trim();
                        textoNombre.textContent = usuario.nombre;
                        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
                        gestionarSesion();
                    }
                });
            }

            const textoPlan = document.getElementById('texto-plan');
            if (textoPlan) {
                textoPlan.textContent = usuario.rol ? usuario.rol.toUpperCase() : 'BÁSICO';
            }

            const btnGestionar = document.getElementById('btn-gestionar-plan');
            if (btnGestionar) {
                const nuevoBtn = btnGestionar.cloneNode(true);
                btnGestionar.replaceWith(nuevoBtn);
                nuevoBtn.addEventListener('click', () => {
                    window.location.href = 'SUSCRIPCION.html';
                });
            }

            const formPerfil = document.getElementById('form-perfil');
            if (formPerfil) {
                formPerfil.addEventListener('submit', (e) => {
                    e.preventDefault();
                    alert('Cambios guardados correctamente en tu perfil.');
                });
            }

            const btnPass = document.getElementById('btn-cambiar-password');
            if (btnPass) {
                btnPass.addEventListener('click', () => {
                    const passActual = prompt("Por seguridad, introduce tu contraseña actual:");
                    if (passActual) {
                        const passNueva = prompt("Introduce tu nueva contraseña (mínimo 6 caracteres):");
                        if (passNueva && passNueva.length >= 6) {
                            alert('¡Contraseña actualizada con éxito!');
                        } else if (passNueva) {
                            alert('La contraseña es muy corta. Operación cancelada.');
                        }
                    }
                });
            }

            // CARGAMOS LAS RECETAS
            cargarMisRecetasCreadas();

        } else {
            intentosPerfil++;
            if (intentosPerfil < 20) {
                setTimeout(intentarCargarPerfil, 50);
            }
        }
    }

    intentarCargarPerfil();

    function esperarCabecera() {
        const btnAuth = document.getElementById('nav-auth');
        if (btnAuth) {
            gestionarSesion();
        } else {
            setTimeout(esperarCabecera, 50);
        }
    }

    esperarCabecera();
});

function gestionarSesion() {
    const usuarioJson = localStorage.getItem('usuarioLogueado');
    const btnAuth = document.getElementById('nav-auth');
    const btnFavoritos = document.getElementById('nav-favoritos');
    const btnSubir = document.getElementById('nav-subir');
    const btnPremium = document.getElementById('nav-premium');

    // Analizamos los enlaces del móvil
    const enlacesMovil = document.querySelectorAll('.mobile-link');

    if (usuarioJson) {
        const usuario = JSON.parse(usuarioJson);
        const esPremium = (usuario.rol === 'premium' || usuario.premium === true);

        // 1. Lógica para el móvil
        enlacesMovil.forEach(enlace => {
            const texto = enlace.textContent.trim().toLowerCase();

            // CASO ENTRAR -> PERFIL
            if (texto.includes('entrar')) {
                enlace.textContent = 'Mi Perfil';
                enlace.href = 'PERFIL.html';
                enlace.classList.add('mobile-perfil-activo'); // <--- ESTO FALTA: para el CSS coral
            }

            // CASO SUBIR RECETA (Bloqueo en móvil)
            if (texto.includes('subir') && !esPremium) {
                enlace.classList.add('boton-bloqueado'); // <--- ESTO FALTA: para que el móvil se bloquee
            }
        });

        // 2. Lógica para PC (Lo que ya tenías)
        if (btnAuth) {
            btnAuth.href = "PERFIL.html";
            btnAuth.classList.add('nav-perfil-activo');
            const avatarFoto = (usuario.foto && usuario.foto !== "") ? usuario.foto : "img/Usuario SINFONDO.png";
            btnAuth.innerHTML = `<img src="${avatarFoto}" class="avatar-header" title="${usuario.nombre}" alt="Avatar">`;
        }

        if (esPremium) {
            if (btnSubir) btnSubir.classList.remove('boton-bloqueado');
            if (btnPremium) {
                btnPremium.innerHTML = "🌟 Premium";
                btnPremium.classList.add('premium-active');
            }
        } else {
            if (btnSubir) btnSubir.classList.add('boton-bloqueado');
        }

    } else {
        // SI NO HAY SESIÓN: Bloqueamos ambos mundos
        if (btnSubir) btnSubir.classList.add('boton-bloqueado'); // PC

        enlacesMovil.forEach(enlace => { // MÓVIL
            if (enlace.textContent.toLowerCase().includes('subir')) {
                enlace.classList.add('boton-bloqueado');
            }
        });
    }
}

function cargarMisRecetasCreadas() {
    const contenedor = document.getElementById('contenedor-mis-recetas');
    if (!contenedor) return;

    const misRecetasStr = localStorage.getItem('misRecetasCreadas');
    const misRecetasArray = misRecetasStr ? JSON.parse(misRecetasStr) : [];

    if (misRecetasArray.length === 0) {
        contenedor.innerHTML = '';
        const parrafoVacio = document.createElement('p');
        parrafoVacio.className = 'mensaje-vacio-recetas';
        parrafoVacio.textContent = 'Aún no has creado ninguna receta.';
        contenedor.appendChild(parrafoVacio);
        return;
    }

    fetch('templates/tarjeta_receta_horizontal.html')
        .then(res => res.text())
        .then(templateString => {
            contenedor.innerHTML = '';

            const parser = new DOMParser();
            const templateDoc = parser.parseFromString(templateString, 'text/html');
            const templateBase = templateDoc.body.firstElementChild;

            misRecetasArray.forEach(receta => {
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
                if (descEl) descEl.textContent = receta.descripcion.length > 100 ? receta.descripcion.substring(0, 100) + '...' : receta.descripcion;

                const detallesList = tarjetaDom.querySelectorAll('.lista-mini li');
                if (detallesList.length >= 3) {
                    detallesList[0].textContent = `⏱️ ${receta.tiempo || receta.duracion_categoria}`;
                    detallesList[1].textContent = `👨‍🍳 ${receta.dificultad.charAt(0).toUpperCase() + receta.dificultad.slice(1)}`;
                    detallesList[2].textContent = `⭐ 5.0 (Nueva)`;
                }

                const filaIconos = tarjetaDom.querySelector('.fila-iconos-receta');
                if (filaIconos) {
                    filaIconos.innerHTML = '';
                }

                const btnCorazon = tarjetaDom.querySelector('.btn-fav-receta');
                if (btnCorazon) {
                    btnCorazon.textContent = '🗑️';
                    btnCorazon.classList.add('btn-borrar-receta');
                    btnCorazon.title = 'Borrar mi receta';

                    btnCorazon.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm(`¿Seguro que quieres borrar la receta "${receta.titulo}"?`)) {
                            const filtradas = misRecetasArray.filter(r => r.id !== receta.id);
                            localStorage.setItem('misRecetasCreadas', JSON.stringify(filtradas));
                            cargarMisRecetasCreadas();
                        }
                    });
                }

                contenedor.appendChild(tarjetaDom);
            });
        })
        .catch(error => console.error("Error cargando mis recetas:", error));
}