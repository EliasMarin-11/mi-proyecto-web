document.addEventListener('DOMContentLoaded', () => {

    const contenedores = document.querySelectorAll('[data-include]');

    contenedores.forEach((contenedor) => {
        const archivo = contenedor.getAttribute('data-include');

        fetch(archivo)
            .then(respuesta => {
                if (respuesta.ok) return respuesta.text();
                throw new Error('Error de red');
            })
            .then(html => {
                contenedor.innerHTML = html;
                contenedor.removeAttribute('data-include');

                // Solo ejecutamos la lógica si el archivo cargado es un header
                if (archivo.includes('header')) {
                    resaltarPaginaActual();
                }
            })
            .catch(error => console.error(`Error al intentar cargar el archivo: ${archivo}`, error));
    });
});

// Función que compara la URL actual con los enlaces del menú
function resaltarPaginaActual() {
    let rutaActual = window.location.pathname.split('/').pop();
    if (rutaActual === '' || rutaActual === '/') rutaActual = 'index.html';

    const enlaces = document.querySelectorAll('.header-centro a, .header-derecha a, .mobile-nav-links a');

    enlaces.forEach(enlace => {
        const href = enlace.getAttribute('href');
        // Usamos toLowerCase() para evitar fallos por mayúsculas/minúsculas
        if (href && href.toLowerCase() === rutaActual.toLowerCase()) {
            enlace.classList.add('active-nav');
        }
    });
}

/* =======================================================
  MENÚ HAMBURGUESA (MÓVIL)
   ======================================================= */
document.addEventListener('click', function(e) {
    if (e.target.closest('#burgerBtn')) {
        const menu = document.getElementById('mobileMenu');
        if(menu) {
            menu.classList.toggle('active');
        }
    }

    if (!e.target.closest('#mobileMenu') && !e.target.closest('#burgerBtn')) {
        const menu = document.getElementById('mobileMenu');
        if(menu && menu.classList.contains('active')) {
            menu.classList.remove('active');
        }
    }
});