// ==========================================
// MAIN.JS - SOLO PARA EL CARRUSEL DE LA HOME
// ==========================================

// 1. Carga de recetas tendencia
fetch('data/db.json')
    .then(response => response.json())
    .then(data => {
        const contenedor = document.getElementById('tarjetas_trending');

        data.recetas.forEach(receta => {
            const tarjetaHTML = `
                <a href="${receta.enlace}" class="enlace_tarjeta slider-item" style="text-decoration: none;">
                    <article class="tarjeta-v">
                        <div class="placeholder-v">
                            <img src="${receta.imagen}" alt="${receta.titulo}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
                        </div>
                        <div class="tarjeta-v-header">
                            <h2>${receta.titulo}</h2>
                        </div>
                        <div class="tarjeta-v-content">
                            <p>⏱️ ${receta.tiempo} | 👨‍🍳 ${receta.dificultad} | ⭐ ${receta.estrellas || 5}</p>
                        </div>
                    </article>
                </a>
            `;
            if (contenedor) contenedor.innerHTML += tarjetaHTML;
        });
    })
    .catch(error => console.error('Error cargando la base de datos:', error));


// 2. Lógica del carrusel infinito
document.addEventListener('DOMContentLoaded', () => {
    const btnIzq = document.getElementById('btn-izq');
    const btnDer = document.getElementById('btn-der');
    const slider = document.getElementById('tarjetas_trending');

    if (btnIzq && btnDer && slider) {
        btnDer.addEventListener('click', () => {
            const primeraTarjeta = slider.firstElementChild;
            if (!primeraTarjeta) return;

            const anchoDesplazamiento = primeraTarjeta.offsetWidth + 30;
            slider.scrollBy({ left: anchoDesplazamiento, behavior: 'smooth' });

            setTimeout(() => {
                slider.appendChild(primeraTarjeta);
                slider.scrollLeft -= anchoDesplazamiento;
            }, 300);
        });

        btnIzq.addEventListener('click', () => {
            const ultimaTarjeta = slider.lastElementChild;
            if (!ultimaTarjeta) return;

            const anchoDesplazamiento = ultimaTarjeta.offsetWidth + 30;
            slider.prepend(ultimaTarjeta);
            slider.scrollLeft += anchoDesplazamiento;

            setTimeout(() => {
                slider.scrollBy({ left: -anchoDesplazamiento, behavior: 'smooth' });
            }, 10);
        });
    }
});