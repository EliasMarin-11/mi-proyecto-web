document.addEventListener('DOMContentLoaded', () => {

    // Contenedor principal en SUBIR_RECETA.html donde va el formulario
    // (Asegúrate de tener un <div id="contenedor-formulario"></div> o similar en tu HTML principal)
    const contenedorPrincipal = document.querySelector('.contenedor-crear-receta');

    if (!contenedorPrincipal) return;

    // 1. CARGAMOS EL TEMPLATE CON PROMESAS (Al estilo main.js)
    fetch('templates/formulario_receta.html')
        .then(res => res.text())
        .then(templateHTML => {
            // Inyectamos el formulario base
            contenedorPrincipal.innerHTML = templateHTML;

            // ==========================================
            // AHORA QUE EL HTML EXISTE, CAPTURAMOS LOS ELEMENTOS
            // ==========================================
            const btnAddIngrediente = document.getElementById('btn-add-ingrediente');
            const btnAddPaso = document.getElementById('btn-add-paso');
            const formulario = document.getElementById('formulario-nueva-receta');

            // 2. EVENTO PARA AÑADIR INGREDIENTE (DOM Puro, sin HTML incrustado)
            if (btnAddIngrediente) {
                btnAddIngrediente.addEventListener('click', (evento) => {
                    evento.preventDefault();
                    const contenedor = document.getElementById('contenedor-ingredientes');

                    const nuevaFila = document.createElement('div');
                    nuevaFila.classList.add('fila-ingrediente');

                    const inputCant = document.createElement('input');
                    inputCant.type = 'text';
                    inputCant.placeholder = 'Cant.';
                    inputCant.classList.add('input-caja', 'ing-cant');
                    inputCant.required = true;

                    const inputMedida = document.createElement('input');
                    inputMedida.type = 'text';
                    inputMedida.placeholder = 'Medida';
                    inputMedida.classList.add('input-caja', 'ing-medida');
                    inputMedida.required = true;

                    const inputNombre = document.createElement('input');
                    inputNombre.type = 'text';
                    inputNombre.placeholder = 'Ingrediente';
                    inputNombre.classList.add('input-caja', 'ing-nombre');
                    inputNombre.required = true;

                    nuevaFila.appendChild(inputCant);
                    nuevaFila.appendChild(inputMedida);
                    nuevaFila.appendChild(inputNombre);

                    contenedor.insertBefore(nuevaFila, btnAddIngrediente);
                });
            }

            // 3. EVENTO PARA AÑADIR PASO (DOM Puro)
            if (btnAddPaso) {
                btnAddPaso.addEventListener('click', (evento) => {
                    evento.preventDefault();
                    const contenedor = document.getElementById('contenedor-pasos');
                    const numeroDePasos = contenedor.querySelectorAll('.paso-texto').length + 1;

                    const nuevoPaso = document.createElement('textarea');
                    nuevoPaso.classList.add('textarea-paso', 'paso-texto');
                    nuevoPaso.placeholder = `Paso ${numeroDePasos}: ...`;
                    nuevoPaso.required = true;

                    contenedor.insertBefore(nuevoPaso, btnAddPaso);
                });
            }

            // 4. EVENTO PARA SUBMIT CON FETCH (.then / .catch)
            if (formulario) {
                formulario.addEventListener('submit', (evento) => {
                    evento.preventDefault();

                    const titulo = document.getElementById('receta-titulo').value;
                    const tiempo = document.getElementById('receta-tiempo').value;
                    const raciones = document.getElementById('receta-raciones').value;
                    const dificultad = document.getElementById('receta-dificultad').value;
                    const descripcion = document.getElementById('receta-desc').value;

                    const arrayIngredientes = [];
                    document.querySelectorAll('.fila-ingrediente').forEach(fila => {
                        const cant = fila.querySelector('.ing-cant').value;
                        const medida = fila.querySelector('.ing-medida').value;
                        const nombre = fila.querySelector('.ing-nombre').value;
                        if (nombre) {
                            arrayIngredientes.push(`${cant} ${medida} de ${nombre}`.trim());
                        }
                    });

                    const arrayPasos = [];
                    document.querySelectorAll('.paso-texto').forEach(textarea => {
                        if (textarea.value.trim() !== '') {
                            arrayPasos.push(textarea.value.trim());
                        }
                    });

                    const nuevaReceta = {
                        titulo: titulo,
                        tiempo: tiempo,
                        raciones: raciones,
                        dificultad: dificultad,
                        descripcion: descripcion,
                        ingredientes: arrayIngredientes,
                        instrucciones: arrayPasos,
                        imagen: "assets/img/receta-placeholder.jpg",
                        estrellas: 0
                    };

                    // Promesa pura, calcado a tus otros archivos
                    fetch('http://localhost:3000/recetas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(nuevaReceta)
                    })
                        .then(res => {
                            if (res.ok) {
                                alert('¡Receta subida con éxito! 👨‍🍳');
                                formulario.reset();
                            } else {
                                console.error('Error en la respuesta del servidor');
                            }
                        })
                        .catch(error => console.error('Error de red al subir la receta:', error));
                });
            }
        })
        .catch(error => console.error('Error cargando el template del formulario:', error));
});