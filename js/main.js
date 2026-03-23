//homepage

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('tarjetas_trending');

    // Si no estamos en la Home, no ejecutamos esto
    if (!slider) return;

    // Metemos el JSON y el Template a cargar a la vez
    Promise.all([
        fetch('data/db.json').then(res => res.json()),
        fetch('templates/tarjeta_receta_vertical.html').then(res => res.text())
    ])
        .then(([data, templateHTML]) => {
            let htmlAcumulado = '';

            // --- 1. LEER LAS RESEÑAS LOCALES ---
            const localesStr = localStorage.getItem('reseñasLocales');
            const reseñasLocalesTodas = localesStr ? JSON.parse(localesStr) : {};

            data.recetas.forEach(receta => {
                // --- 2. CALCULAR LA NOTA MEDIA REAL DE ESTA RECETA ---
                const jsonReseñas = Array.isArray(receta.reseñas) ? receta.reseñas : [];
                const misLocales = reseñasLocalesTodas[receta.id] || [];
                const todasLasReseñas = [...jsonReseñas, ...misLocales];

                let mediaReal = receta.estrellas || 5;
                if (todasLasReseñas.length > 0) {
                    let suma = 0;
                    todasLasReseñas.forEach(r => suma += r.puntuacion);
                    mediaReal = parseFloat((suma / todasLasReseñas.length).toFixed(1));
                }

                // --- 3. INYECTAR LA MEDIA REAL EN EL TEMPLATE ---
                let tarjetaRellena = templateHTML
                    .replace('<h2>LOREMIPSUM</h2>', `<h2>${receta.titulo}</h2>`)
                    .replace('<div class="placeholder-v"></div>', `<img src="${receta.imagen}" alt="${receta.titulo}" class="img-tarjeta-v">`)
                    .replace('<p>loremipsumloremipsum</p>', `<p>⏱️ ${receta.tiempo}</p>`)
                    .replace('<p>loremipsumloremipsum</p>', `<p>👨‍🍳 ${receta.dificultad.charAt(0).toUpperCase() + receta.dificultad.slice(1)}</p>`)
                    .replace('<p>loremipsumloremipsum</p>', `<p>⭐ ${mediaReal}</p>`); // <--- Aquí inyectamos la nota calculada

                // (Nota: He actualizado el href para que use tu sistema de IDs)
                htmlAcumulado += `
                <a href="VER_RECETA.html?id=${receta.id}" class="enlace_tarjeta slider-item">
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

    // --- GESTIÓN DEL ESTADO DE SESIÓN EN EL HEADER ---
    const usuarioJson = localStorage.getItem('usuarioLogueado');

    if (usuarioJson) {
        const usuario = JSON.parse(usuarioJson);

        const enlacesNav = document.querySelectorAll('header nav ul li a');
        let enlaceLogin = null;

        enlacesNav.forEach(enlace => {
            const texto = enlace.textContent.toUpperCase();
            if (texto.includes('ENTRAR') || texto.includes('INICIAR') || texto.includes('PERFIL')) {
                enlaceLogin = enlace;
            }
        });

        if (enlaceLogin) {
            enlaceLogin.textContent = '';
            enlaceLogin.href = 'perfil.html';

            const imgAvatarHeader = document.createElement('img');
            imgAvatarHeader.src = usuario.foto && usuario.foto !== "" ? usuario.foto : 'img/Usuario SINFONDO.png';
            imgAvatarHeader.alt = 'Ir a mi perfil';
            enlaceLogin.appendChild(imgAvatarHeader);
        }
    }
});