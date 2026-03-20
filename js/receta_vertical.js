
document.addEventListener('DOMContentLoaded', () => {

    const parametrosURL = new URLSearchParams(window.location.search);
    const idReceta = parseInt(parametrosURL.get('id'));

    if (!idReceta) {
        return;
    }

    // Función "Vigilante" para esperar al template
    function esperarTemplate() {
        const tituloDOM = document.getElementById('receta-titulo');

        if (tituloDOM) {
            cargarDatosReceta(idReceta);
        } else {
            // Si no existe, lo volvemos a intentar en 50ms
            setTimeout(esperarTemplate, 50);
        }
    }

    esperarTemplate();
});

async function cargarDatosReceta(idReceta) {
    try {
        const respuesta = await fetch('data/db.json');
        const data = await respuesta.json();

        const receta = data.recetas.find(r => r.id === idReceta);

        if (!receta) {
            console.error("❌ ERROR: No existe ninguna receta con el ID " + idReceta + " en el JSON.");
            return;
        }

        // inyección de datos
        document.getElementById('receta-titulo').textContent = receta.titulo;
        document.getElementById('receta-tiempo').textContent = receta.tiempo;
        document.getElementById('receta-dificultad').textContent = receta.dificultad;
        document.getElementById('receta-descripcion').textContent = receta.descripcion;

        // --- CÁLCULO DE LA NOTA MEDIA REAL EN LA CABECERA ---
        const contenedorEstrellas = document.getElementById('receta-estrellas-hero');
        if (contenedorEstrellas) {
            const localesStr = localStorage.getItem('reseñasLocales');
            const localesObj = localesStr ? JSON.parse(localesStr) : {};
            const misLocales = localesObj[idReceta] || [];

            const jsonReseñas = Array.isArray(receta.reseñas) ? receta.reseñas : [];
            const todasLasReseñas = [...jsonReseñas, ...misLocales];

            if (todasLasReseñas.length > 0) {
                let suma = 0;
                todasLasReseñas.forEach(r => suma += r.puntuacion);
                const mediaReal = parseFloat((suma / todasLasReseñas.length).toFixed(1));

                contenedorEstrellas.textContent = `⭐ ${mediaReal} (${todasLasReseñas.length} opiniones)`;
            } else {
                contenedorEstrellas.textContent = `⭐ Sin valoraciones`;
            }
        }

        if (document.getElementById('receta-raciones')) {
            document.getElementById('receta-raciones').textContent = receta.raciones;
        }

        document.getElementById('receta-foto').innerHTML =
            `<img src="${receta.imagen}" alt="${receta.titulo}" class="img-receta-detalle">`;

        let htmlIngredientes = '';
        receta.ingredientes.forEach(ing => htmlIngredientes += `<li>${ing}</li>`);
        document.getElementById('receta-ingredientes').innerHTML = htmlIngredientes;

        let htmlInstrucciones = '';
        receta.instrucciones.forEach((paso, index) => {
            htmlInstrucciones += `<p><strong>Paso ${index + 1}:</strong> ${paso}</p>`;
        });
        document.getElementById('receta-instrucciones').innerHTML = htmlInstrucciones;

        const cajaAlergenos = document.getElementById('receta-alergenos');

        if (cajaAlergenos) {
            if (receta.alergenos && receta.alergenos.length > 0) {

                fetch('templates/alergeno.html') // Corregido el path para evitar problemas locales
                    .then(respuesta => respuesta.text())
                    .then(templateHtml => {

                        let htmlFinal = '';

                        receta.alergenos.forEach(idAlergeno => {

                            const infoAlergeno = data.alergenos.find(a => a.icono === idAlergeno);

                            if (infoAlergeno) {
                                let itemRelleno = templateHtml
                                    .replace(
                                        '<div class="alergeno-icono"></div>',
                                        `<div class="alergeno-icono"><img src="img/${infoAlergeno.icono}.png" class="img-alergeno-fluida" alt="${infoAlergeno.titulo}"></div>`
                                    )
                                    .replace(
                                        '<div class="alergeno-tooltip"></div>',
                                        `<div class="alergeno-tooltip"><strong>${infoAlergeno.titulo}</strong><span>${infoAlergeno.texto}</span></div>`
                                    );

                                htmlFinal += itemRelleno;
                            }
                        });
                        cajaAlergenos.innerHTML = htmlFinal;
                    })
                    .catch(error => console.error("Error cargando el template:", error));

            } else {
                cajaAlergenos.innerHTML = `<span class="texto-sin-alergenos">✅ Libre de alérgenos</span>`;
                cajaAlergenos.closest('.info-linea-iconos').classList.add('sin-alergenos');
            }
        }
        aplicarVerMas('receta-descripcion', 100);
        aplicarVerMas('receta-ingredientes', 350);
        aplicarVerMas('receta-instrucciones', 450);
    } catch (error) {
        console.error("❌ ERROR FATAL en el fetch:", error);
    }
}

function aplicarVerMas(idElemento, alturaMaxima) {
    const elemento = document.getElementById(idElemento);
    if (!elemento) return;

    setTimeout(() => {
        if (elemento.scrollHeight > alturaMaxima) {

            const wrapper = document.createElement('div');
            wrapper.className = 'contenedor-restringido';
            wrapper.style.maxHeight = alturaMaxima + 'px';

            elemento.parentNode.insertBefore(wrapper, elemento);
            wrapper.appendChild(elemento);

            const sombra = document.createElement('div');
            sombra.className = 'sombra-desvanecimiento';
            wrapper.appendChild(sombra);

            const btn = document.createElement('button');
            btn.className = 'btn-ver-mas';
            btn.innerHTML = 'VER MÁS ⬇️';

            wrapper.parentNode.insertBefore(btn, wrapper.nextSibling);

            btn.onclick = () => {
                if (wrapper.style.maxHeight === alturaMaxima + 'px') {
                    wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
                    btn.innerHTML = 'VER MENOS ⬆️';
                    sombra.style.opacity = '0';
                } else {
                    wrapper.style.maxHeight = alturaMaxima + 'px';
                    btn.innerHTML = 'VER MÁS ⬇️';
                    sombra.style.opacity = '1';
                }
            };
        }
    }, 100);
}