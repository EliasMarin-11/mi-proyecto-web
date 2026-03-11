document.addEventListener('DOMContentLoaded', () => {

    // Escuchamos los clics en todo el documento. Si es el de logout, cerramos sesión.
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'btn-logout') {
            e.preventDefault();
            localStorage.removeItem('usuarioLogueado');
            window.location.href = "index.html";
        }
    });

    function esperarCabecera() {
        const btnAuth = document.getElementById('nav-auth');

        if (btnAuth) {
            //botón ya existe en el HTML, ejecutamos la sesión
            gestionarSesion();
        } else {
            //no existe, volvemos a intentarlo en 50 milisegundos
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

    //quitamos bloqueos
    if (btnFavoritos) btnFavoritos.classList.remove('boton-bloqueado');
    if (btnSubir) btnSubir.classList.remove('boton-bloqueado');

    if (usuarioJson) {
        // loguedo
        const usuario = JSON.parse(usuarioJson);
        document.body.classList.add('rol-' + usuario.rol);

        if (btnAuth) {
            btnAuth.href = "PERFIL.html";
            btnAuth.classList.add('nav-perfil-activo'); // CSS

            const avatarFoto = (usuario.foto && usuario.foto !== "") ? usuario.foto : "img/Usuario SINFONDO.png";
            btnAuth.innerHTML = `<img src="${avatarFoto}" class="avatar-header" title="${usuario.nombre}" alt="Avatar">`;
        }

        if (usuario.rol === 'premium') {
            if (btnPremium) {
                btnPremium.innerHTML = "🌟 Premium";
                btnPremium.classList.add('premium-active');
            }
        } else {
            // Si no es premium, le bloqueamos el botón de subir receta
            if (btnSubir) btnSubir.classList.add('boton-bloqueado');
        }

    } else {
        // no logueado
        if (btnFavoritos) btnFavoritos.classList.add('boton-bloqueado');
        if (btnSubir) btnSubir.classList.add('boton-bloqueado');
    }
}