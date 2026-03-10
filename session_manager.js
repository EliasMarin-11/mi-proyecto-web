function gestionarSesion() {
    const usuarioJson = localStorage.getItem('usuarioLogueado');
    const btnAuth = document.getElementById('nav-auth');
    const btnFavoritos = document.getElementById('nav-favoritos');
    const btnSubir = document.getElementById('nav-subir');
    const btnPremium = document.getElementById('nav-premium');

    // 1. Limpieza inicial de bloqueos
    [btnFavoritos, btnSubir].forEach(btn => {
        if(btn) btn.classList.remove('boton-bloqueado');
    });

    if (usuarioJson) {
        const usuario = JSON.parse(usuarioJson);
        document.body.classList.add('rol-' + usuario.rol);

        if (btnAuth) {
            btnAuth.href = "PERFIL.html";
            btnAuth.style.background = "none";
            btnAuth.style.boxShadow = "none";
            btnAuth.style.padding = "0";

            if (usuario.foto && usuario.foto !== "") {
                btnAuth.innerHTML = `<img src="${usuario.foto}" class="avatar-header" title="${usuario.nombre}">`;
            } else {
                // Tu PNG sin fondo para Juan o si María no tiene foto
                btnAuth.innerHTML = `<img src="img/Usuario SINFONDO.png" class="avatar-header" title="${usuario.nombre}">`;
            }
        }

        // Lógica de botones según ROL
        if (usuario.rol === 'premium') {
            if (btnPremium) {
                btnPremium.innerHTML = "🌟 Premium";
                btnPremium.classList.add('premium-active');
            }
        } else {
            if (btnSubir) btnSubir.classList.add('boton-bloqueado');
        }

    } else {
        // Invitado: Bloqueamos funciones
        if (btnFavoritos) btnFavoritos.classList.add('boton-bloqueado');
        if (btnSubir) btnSubir.classList.add('boton-bloqueado');
    }
}

// 2. FUNCIÓN DE CIERRE DE SESIÓN (Separada para que sea más limpia)
function configurarLogout() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = (e) => { // Usamos .onclick para evitar duplicados
            e.preventDefault();
            localStorage.removeItem('usuarioLogueado');
            window.location.href = "index.html";
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        gestionarSesion();
        configurarLogout(); // Activamos el botón de salir si existe en la página
    }, 200);
});