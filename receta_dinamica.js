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

                        // Pintamos los textos
                        tituloDOM.textContent = receta.titulo;
                        document.getElementById('receta-tiempo').textContent = receta.tiempo;
                        document.getElementById('receta-dificultad').textContent = receta.dificultad;
                        document.getElementById('receta-descripcion').textContent = receta.descripcion;

                        // Pintamos la imagen
                        document.getElementById('receta-foto').innerHTML = `<img src="${receta.imagen}" alt="${receta.titulo}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;

                        // Pintamos los ingredientes
                        const listaIngredientes = document.getElementById('receta-ingredientes');
                        listaIngredientes.innerHTML = ''; // Limpiamos primero
                        if(receta.ingredientes) {
                            receta.ingredientes.forEach(ing => {
                                listaIngredientes.innerHTML += `<li>${ing}</li>`;
                            });
                        }

                        // Pintamos las instrucciones
                        const listaInstrucciones = document.getElementById('receta-instrucciones');
                        listaInstrucciones.innerHTML = '';
                        if(receta.instrucciones) {
                            receta.instrucciones.forEach((paso, index) => {
                                listaInstrucciones.innerHTML += `<p><strong>Paso ${index + 1}:</strong> ${paso}</p>`;
                            });
                        }
                    }
                }, 100);
            }
        })
        .catch(error => console.error("Error al cargar la base de datos:", error));
}