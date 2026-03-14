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