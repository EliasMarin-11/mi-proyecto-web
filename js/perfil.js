document.addEventListener('DOMContentLoaded', () => {

    // 1. Cerrar Sesión
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'btn-logout') {
            e.preventDefault();
            localStorage.removeItem('usuarioLogueado');
            window.location.href = "index.html";
        }
    });

    let intentosPerfil = 0;

    function intentarCargarPerfil() {
        // Buscamos si el HTML del perfil ya se inyectó en la pantalla
        const textoNombre = document.querySelector('.perfil-nombre');

        if (textoNombre) {
            const usuarioJson = localStorage.getItem('usuarioLogueado');

            if (usuarioJson) {
                const usuario = JSON.parse(usuarioJson);

                textoNombre.textContent = usuario.nombre; // Cambia el título

                const inputEmail = document.querySelector('.perfil-formulario input[type="email"]');
                if (inputEmail) inputEmail.value = usuario.email; // Cambia el correo

                const inputNombre = document.querySelector('.perfil-formulario input[type="text"]');
                if (inputNombre) inputNombre.value = usuario.nombre; // Cambia el input
            }
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

    if (btnFavoritos) btnFavoritos.classList.remove('boton-bloqueado');
    if (btnSubir) btnSubir.classList.remove('boton-bloqueado');

    if (usuarioJson) {
        const usuario = JSON.parse(usuarioJson);
        document.body.classList.add('rol-' + usuario.rol);

        if (btnAuth) {
            btnAuth.href = "PERFIL.html";
            btnAuth.classList.add('nav-perfil-activo');

            const avatarFoto = (usuario.foto && usuario.foto !== "") ? usuario.foto : "img/Usuario SINFONDO.png";
            btnAuth.innerHTML = `<img src="${avatarFoto}" class="avatar-header" title="${usuario.nombre}" alt="Avatar">`;
        }

        if (usuario.rol === 'premium' || usuario.premium === true) {
            if (btnPremium) {
                btnPremium.innerHTML = "🌟 Premium";
                btnPremium.classList.add('premium-active');
            }
        } else {
            if (btnSubir) btnSubir.classList.add('boton-bloqueado');
        }

    } else {
        if (btnFavoritos) btnFavoritos.classList.add('boton-bloqueado');
        if (btnSubir) btnSubir.classList.add('boton-bloqueado');
    }
}