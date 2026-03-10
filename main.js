// 1. Ahora llamamos a nuestra base de datos completa
fetch('data/db.json')
    .then(response => response.json())
    .then(data => {
        const contenedor = document.getElementById('tarjetas_trending');

        // 2. IMPORTANTE: Ahora iteramos sobre data.recetas (no sobre data a secas)
        data.recetas.forEach(receta => {
            // Dentro del fetch de main.js, cambia el bloque de la tarjeta por este:
            const tarjetaHTML = `
                <a href="${receta.enlace}" class="enlace_tarjeta" style="text-decoration: none;">
                    <article class="tarjeta-v">
                        <div class="placeholder-v">
                            <img src="${receta.imagen}" alt="${receta.titulo}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
                        </div>
                        <div class="tarjeta-v-header">
                            <h2>${receta.titulo}</h2>
                        </div>
                        <div class="tarjeta-v-content">
                            <p>⏱️ ${receta.tiempo} | 👨‍🍳 ${receta.dificultad} | 🍽️ ${receta.raciones} per.</p>
                        </div>
                    </article>
                </a>
            `;
            contenedor.innerHTML += tarjetaHTML;
        });
    })
    .catch(error => console.error('Error cargando la base de datos:', error));