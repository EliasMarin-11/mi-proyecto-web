function gestionarSesion() {
    const usuarioJson = localStorage.getItem('usuarioLogueado');

    if (usuarioJson) {
        const usuario = JSON.parse(usuarioJson);

        document.body.classList.add('rol-' + usuario.rol);
        // 1. Cambiamos el botón de Login en el Header
        const btnSesion = document.getElementById('boton-sesion');
        if (btnSesion) {
            btnSesion.innerHTML = `<span>Hola, ${usuario.nombre}</span>`;
            btnSesion.href = "PERFIL.html";
            btnSesion.classList.add('logeado'); // Por si quieres darle estilo CSS
        }

        // 2. TAREA 2.4: Diferenciar por ROL (Contenido exclusivo)
        // Buscamos cualquier elemento con la clase 'solo-premium'
        const contenidoPremium = document.querySelectorAll('.solo-premium');

        if (usuario.rol === 'premium') {
            contenidoPremium.forEach(el => el.style.display = 'block');
        } else {
            contenidoPremium.forEach(el => el.style.display = 'none');
        }
    }
}

// Ejecutamos la función cuando todo cargue
document.addEventListener('DOMContentLoaded', () => {
    // Damos un margen para que xlu-include-file cargue el header
    setTimeout(gestionarSesion, 200);
});