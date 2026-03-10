const parametrosURL = new URLSearchParams(window.location.search);
const idReceta = parseInt(parametrosURL.get('id'));

if (idReceta) {
    fetch('data/db.json')
        .then(response => response.json())
        .then(data => {
            const receta = data.recetas.find(r => r.id === idReceta);

            if (receta) {
                // TRUCO: Esperamos a que el template cargue el HTML
                const esperarTemplate = setInterval(() => {
                    const tituloDOM = document.getElementById('receta-titulo');

                    // Si ya existe en la pantalla, pintamos los datos
                    if (tituloDOM) {
                        clearInterval(esperarTemplate); // Paramos el temporizador

                        // 1. Pintamos los textos básicos
                        tituloDOM.textContent = receta.titulo;
                        document.getElementById('receta-tiempo').textContent = receta.tiempo;
                        document.getElementById('receta-dificultad').textContent = receta.dificultad;
                        document.getElementById('receta-descripcion').textContent = receta.descripcion;
                        // Añadimos las raciones si tienes el ID en el HTML
                        if(document.getElementById('receta-raciones')) {
                            document.getElementById('receta-raciones').textContent = receta.raciones;
                        }

                        // 2. Pintamos la imagen
                        document.getElementById('receta-foto').innerHTML = `<img src="${receta.imagen}" alt="${receta.titulo}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;

                        // 3. Pintamos los ingredientes
                        const listaIngredientes = document.getElementById('receta-ingredientes');
                        listaIngredientes.innerHTML = '';
                        if(receta.ingredientes) {
                            receta.ingredientes.forEach(ing => {
                                listaIngredientes.innerHTML += `<li>${ing}</li>`;
                            });
                        }

                        // 4. Pintamos las instrucciones
                        const listaInstrucciones = document.getElementById('receta-instrucciones');
                        listaInstrucciones.innerHTML = '';
                        if(receta.instrucciones) {
                            receta.instrucciones.forEach((paso, index) => {
                                listaInstrucciones.innerHTML += `<p><strong>Paso ${index + 1}:</strong> ${paso}</p>`;
                            });
                        }

                        // 5. ICONOS DE ALÉRGENOS DINÁMICOS
                        const cajaAlergenos = document.getElementById('receta-alergenos');
                        if (cajaAlergenos) {
                            cajaAlergenos.innerHTML = ''; // Limpiamos el "Cargando..."

                            if (receta.alergenos && receta.alergenos.length > 0) {
                                receta.alergenos.forEach(alergeno => {
                                    // El nombre en el JSON debe ser igual al nombre del .png (ej: "gluten")
                                    cajaAlergenos.innerHTML += `
                                        <img src="img/${alergeno}.png" 
                                            alt="Alérgeno: ${alergeno}" 
                                            title="${alergeno.toUpperCase()}" 
                                            style="width: 40px; height: 40px; margin-right: 10px; cursor: help; object-fit: contain;"
                                            onerror="this.style.display='none';">`;
                                });
                            } else {
                                cajaAlergenos.innerHTML = `<span style="color: #2e7d32; font-weight: bold; font-size: 0.9rem;">✅ Sin alérgenos declarados</span>`;
                            }
                        }
                    }
                }, 100);
            }
        })
        .catch(error => console.error("Error al cargar la base de datos:", error));
}