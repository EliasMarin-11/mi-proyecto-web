// ==========================================
// RECETA_DINAMICA.JS - VERSION CORREGIDA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    const parametrosURL = new URLSearchParams(window.location.search);
    const idReceta = parseInt(parametrosURL.get('id'));

    if (!idReceta) {
        return;
    }

    // 2. Función "Vigilante" para esperar al template
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

// 3. La función que hace el trabajo sucio
async function cargarDatosReceta(idReceta) {
    try {
        const respuesta = await fetch('data/db.json');
        const data = await respuesta.json();

        const receta = data.recetas.find(r => r.id === idReceta);

        if (!receta) {
            console.error("❌ ERROR: No existe ninguna receta con el ID " + idReceta + " en el JSON.");
            return;
        }

        // --- INYECCIÓN DE DATOS (Tus líneas de antes) ---
        document.getElementById('receta-titulo').textContent = receta.titulo;
        document.getElementById('receta-tiempo').textContent = receta.tiempo;
        document.getElementById('receta-dificultad').textContent = receta.dificultad;
        document.getElementById('receta-descripcion').textContent = receta.descripcion;

        const contenedorEstrellas = document.getElementById('receta-estrellas-hero');
        if (contenedorEstrellas) {
            // Asumimos que en tu db.json tienes algo como "puntuacion": 4.
            // Si no lo tiene, por defecto pintará 5 estrellas.
            const numEstrellas = receta.estrellas || 5;
            contenedorEstrellas.innerHTML = "⭐".repeat(numEstrellas);
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

                fetch('/templates/alergeno.html')
                    .then(respuesta => respuesta.text())
                    .then(templateHtml => {

                        let htmlFinal = '';
                        const parser = new DOMParser();

                        receta.alergenos.forEach(idAlergeno => {

                            const infoAlergeno = data.alergenos.find(a => a.icono === idAlergeno);

                            if (infoAlergeno) {
                                const doc = parser.parseFromString(templateHtml, 'text/html');
                                const itemDoc = doc.querySelector('.alergeno-item');

                                itemDoc.querySelector('.alergeno-icono').innerHTML =
                                    `<img src="img/${infoAlergeno.icono}.png" class="img-alergeno-fluida" alt="${infoAlergeno.titulo}">`;

                                itemDoc.querySelector('.alergeno-tooltip').innerHTML =
                                    `<strong>${infoAlergeno.titulo}</strong><span>${infoAlergeno.texto}</span>`;

                                htmlFinal += itemDoc.outerHTML;
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
    } catch (error) {
        console.error("❌ ERROR FATAL en el fetch:", error);
    }
}