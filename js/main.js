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

    // --- 3. GESTIÓN DEL ESTADO DE SESIÓN EN EL HEADER ---
    const usuarioJson = localStorage.getItem('usuarioLogueado');

    if (usuarioJson) {
        const usuario = JSON.parse(usuarioJson);

        // Buscamos todos los enlaces de la navegación principal
        const enlacesNav = document.querySelectorAll('header nav ul li a');
        let enlaceLogin = null;

        // Filtramos para encontrar el que dice "Entrar", "Login" o "Perfil"
        enlacesNav.forEach(enlace => {
            const texto = enlace.textContent.toUpperCase();
            if (texto.includes('ENTRAR') || texto.includes('INICIAR') || texto.includes('PERFIL')) {
                enlaceLogin = enlace;
            }
        });

        if (enlaceLogin) {
            // Vaciamos el texto original
            enlaceLogin.textContent = '';
            enlaceLogin.href = 'perfil.html';

            // Aseguramos que el enlace se comporte como contenedor flexible para alinear la imagen
            enlaceLogin.style.display = 'flex';
            enlaceLogin.style.alignItems = 'center';
            enlaceLogin.style.padding = '0'; // Ajuste por si el 'a' tenía padding muy grande

            // Creamos el nodo de la imagen de forma segura
            const imgAvatarHeader = document.createElement('img');
            imgAvatarHeader.src = usuario.foto && usuario.foto !== "" ? usuario.foto : 'img/Usuario SINFONDO.png';
            imgAvatarHeader.alt = 'Ir a mi perfil';

            // Estilos para que encaje como un icono circular en el header
            imgAvatarHeader.style.width = '35px';
            imgAvatarHeader.style.height = '35px';
            imgAvatarHeader.style.borderRadius = '50%';
            imgAvatarHeader.style.objectFit = 'cover';
            imgAvatarHeader.style.border = '2px solid #4E1A0A'; // Ajusta al color de tu web
            imgAvatarHeader.style.cursor = 'pointer';

            // Añadimos la imagen al enlace
            enlaceLogin.appendChild(imgAvatarHeader);
        }
    }
});