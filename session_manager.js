function gestionarSesion() {
    const usuarioJson = localStorage.getItem('usuarioLogueado');

    // 1. Capturamos los elementos por los IDs que pusimos en el header.html
    const btnAuth = document.getElementById('nav-auth');
    const btnFavoritos = document.getElementById('nav-favoritos');
    const btnSubir = document.getElementById('nav-subir');
    const btnPremium = document.getElementById('nav-premium');

    // Limpieza inicial: quitamos bloqueos por defecto para recalcular
    [btnFavoritos, btnSubir].forEach(btn => {
        if(btn) btn.classList.remove('boton-bloqueado');
    });

    if (usuarioJson) {
        const usuario = JSON.parse(usuarioJson);
        document.body.classList.add('rol-' + usuario.rol);

        // A. SUSTITUIR "ENTRAR" POR FOTO O ICONO
        if (btnAuth) {
            btnAuth.href = "PERFIL.html";
            // Estilizamos el contenedor para que la foto luzca bien
            btnAuth.style.background = "none";
            btnAuth.style.boxShadow = "none";
            btnAuth.style.padding = "0";

            if (usuario.foto && usuario.foto !== "") {
                btnAuth.innerHTML = `<img src="${usuario.foto}" class="avatar-header" title="${usuario.nombre}">`;
            } else {
                btnAuth.innerHTML = `<img src="img/Usuario SINFONDO.png" class="avatar-header" title="${usuario.nombre}">`;            }
        }

        // B. LÓGICA DE ROLES (Premium vs Básico)
        if (usuario.rol === 'premium') {
            // María: Todo desbloqueado y botón premium brillante
            if (btnPremium) {
                btnPremium.innerHTML = "🌟 Eres Premium";
                btnPremium.classList.add('premium-active');
            }
        } else {
            // Juan (Básico): Bloqueamos "Subir Receta" con el color suave
            if (btnSubir) btnSubir.classList.add('boton-bloqueado');
        }

    } else {
        // --- SI NO HAY NADIE LOGUEADO ---
        // Bloqueamos Favoritos y Subir Receta para invitados
        if (btnFavoritos) btnFavoritos.classList.add('boton-bloqueado');
        if (btnSubir) btnSubir.classList.add('boton-bloqueado');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Mantengo tu margen de 200ms para el xlu-include-file
    setTimeout(gestionarSesion, 200);
});