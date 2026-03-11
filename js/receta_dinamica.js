// ==========================================
// RECETA_DINAMICA.JS - PÁGINA DE DETALLE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const parametrosURL = new URLSearchParams(window.location.search);
    const idReceta = parseInt(parametrosURL.get('id'));

    // Solo ejecutamos si hay un ID en la URL y estamos en la página de receta
    const tituloDOM = document.getElementById('receta-titulo');

    if (idReceta && tituloDOM) {
        fetch('data/db.json')
            .then(response => response.json())
            .then(data => {
                const receta = data.recetas.find(r => r.id === idReceta);

                if (receta) {
                    // 1. Textos básicos
                    tituloDOM.textContent = receta.titulo;
                    document.getElementById('receta-tiempo').textContent = receta.tiempo;
                    document.getElementById('receta-dificultad').textContent = receta.dificultad;
                    document.getElementById('receta-descripcion').textContent = receta.descripcion;

                    if (document.getElementById('receta-raciones')) {
                        document.getElementById('receta-raciones').textContent = receta.raciones;
                    }

                    // 2. Imagen (usamos clases CSS, nada de estilos en línea)
                    document.getElementById('receta-foto').innerHTML = `<img src="${receta.imagen}" alt="${receta.titulo}" class="img-receta-detalle">`;

                    // 3. Ingredientes (optimizando la carga)
                    let htmlIngredientes = '';
                    receta.ingredientes.forEach(ing => htmlIngredientes += `<li>${ing}</li>`);
                    document.getElementById('receta-ingredientes').innerHTML = htmlIngredientes;

                    // 4. Instrucciones
                    let htmlInstrucciones = '';
                    receta.instrucciones.forEach((paso, index) => {
                        htmlInstrucciones += `<p><strong>Paso ${index + 1}:</strong> ${paso}</p>`;
                    });
                    document.getElementById('receta-instrucciones').innerHTML = htmlInstrucciones;

                    // 5. Alérgenos Dinámicos (limpio y con clases CSS)
                    const cajaAlergenos = document.getElementById('receta-alergenos');
                    if (cajaAlergenos) {
                        if (receta.alergenos && receta.alergenos.length > 0) {
                            let htmlAlergenos = '';
                            receta.alergenos.forEach(alergeno => {
                                htmlAlergenos += `<img src="img/${alergeno}.png" alt="Alérgeno: ${alergeno}" title="${alergeno.toUpperCase()}" class="icono-alergeno">`;
                            });
                            cajaAlergenos.innerHTML = htmlAlergenos;
                        } else {
                            cajaAlergenos.innerHTML = `<span class="texto-ok">✅ Sin alérgenos declarados</span>`;
                        }
                    }
                }
            })
            .catch(error => console.error("Error al cargar la receta:", error));
    }
});