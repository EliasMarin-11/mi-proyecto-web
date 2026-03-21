document.addEventListener('DOMContentLoaded', () => {

    // buscamos etiquetas "data-include"
    const contenedores = document.querySelectorAll('[data-include]');

    contenedores.forEach(async (contenedor) => {

        //leemos nombre del archivo
        const archivo = contenedor.getAttribute('data-include');

        try {
            //buscamos el archivo
            const respuesta = await fetch(archivo);

            if (respuesta.ok) {
                //metemos el texto HTML dentro de la etiqueta
                contenedor.innerHTML = await respuesta.text();

                //borramos "data-include" para dejarlo todo bien
                contenedor.removeAttribute('data-include');
            }
        } catch (error) {
            console.error(`Error al intentar cargar el archivo: ${archivo}`);
        }
    });
});

/* =======================================================
  MENÚ HAMBURGUESA (MÓVIL)
   ======================================================= */
document.addEventListener('click', function(e) {
    if (e.target.closest('#burgerBtn')) {
        const menu = document.getElementById('mobileMenu');
        if(menu) {
            //cerrar
            menu.classList.toggle('active');
        }
    }

    // si clic fuera del menu, cerrar
    if (!e.target.closest('#mobileMenu') && !e.target.closest('#burgerBtn')) {
        const menu = document.getElementById('mobileMenu');
        if(menu && menu.classList.contains('active')) {
            menu.classList.remove('active');
        }
    }
});