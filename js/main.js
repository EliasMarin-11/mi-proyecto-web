//homepage

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('tarjetas_trending');

    // Si no estamos en la Home, no ejecutamos esto
    if (!slider) return;

    //Metemos el JSON y el Template a cargar a la vez
    Promise.all([
        fetch('data/db.json').then(res => res.json()),
        fetch('templates/tarjeta_receta_vertical.html').then(res => res.text())
    ])
        .then(([data, templateHTML]) => {
            let htmlAcumulado = '';

            data.recetas.forEach(receta => {
                let tarjetaRellena = templateHTML
                    .replace('<h2>LOREMIPSUM</h2>', `<h2>${receta.titulo}</h2>`)
                    .replace('<div class="placeholder-v"></div>', `<img src="${receta.imagen}" alt="${receta.titulo}" class="img-tarjeta-v">`)
                    .replace('<p>loremipsumloremipsum</p>', `<p>⏱️ ${receta.tiempo}</p>`)
                    .replace('<p>loremipsumloremipsum</p>', `<p>👨‍🍳 ${receta.dificultad.charAt(0).toUpperCase() + receta.dificultad.slice(1)}</p>`)
                    .replace('<p>loremipsumloremipsum</p>', `<p>⭐ ${receta.estrellas}</p>`);

                htmlAcumulado += `
                <a href="${receta.enlace}" class="enlace_tarjeta slider-item">
                    ${tarjetaRellena}
                </a>
            `;
            });

            slider.innerHTML = htmlAcumulado;
        })
        .catch(error => console.error('Error cargando la base de datos o templates:', error));

    // carrusel
    const btnIzq = document.getElementById('btn-izq');
    const btnDer = document.getElementById('btn-der');

    if (btnIzq && btnDer) {

        // boton der
        btnDer.addEventListener('click', () => {
            const primeraTarjeta = slider.firstElementChild;
            if (!primeraTarjeta) return;

            const anchoDesplazamiento = primeraTarjeta.offsetWidth + 30;

            slider.scrollBy({ left: anchoDesplazamiento, behavior: 'smooth' });

            setTimeout(() => {
                slider.appendChild(primeraTarjeta);
                slider.scrollBy({ left: -anchoDesplazamiento, behavior: 'instant' });
            }, 300);
        });

        // boton izq
        btnIzq.addEventListener('click', () => {
            const ultimaTarjeta = slider.lastElementChild;
            if (!ultimaTarjeta) return;

            const anchoDesplazamiento = ultimaTarjeta.offsetWidth + 30;

            slider.prepend(ultimaTarjeta);
            slider.scrollBy({ left: anchoDesplazamiento, behavior: 'instant' });

            setTimeout(() => {
                slider.scrollBy({ left: -anchoDesplazamiento, behavior: 'smooth' });
            }, 10);
        });
    }
});