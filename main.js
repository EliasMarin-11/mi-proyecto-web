// 1. Ahora llamamos a nuestra base de datos completa
fetch('data/db.json')
    .then(response => response.json())
    .then(data => {
        const contenedor = document.getElementById('tarjetas_trending');

        // 2. IMPORTANTE: Ahora iteramos sobre data.recetas (no sobre data a secas)
        data.recetas.forEach(receta => {
            const tarjetaHTML = `
                <a href="${receta.enlace}" class="enlace_tarjeta">
                    <article class="tarjeta_receta_vertical">
                        <div class="foto_rectangular">
                            <img src="${receta.imagen}" alt="${receta.titulo}" style="width:100%; height:100%; object-fit:cover; border-radius:16px;">
                        </div>
                        <h3>${receta.titulo}</h3>
                        <p>⏱️ ${receta.tiempo} | Dificultad: ${receta.dificultad}</p>
                    </article>
                </a>
            `;
            contenedor.innerHTML += tarjetaHTML;
        });
    })
    .catch(error => console.error('Error cargando la base de datos:', error));