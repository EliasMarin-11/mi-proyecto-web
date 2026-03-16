document.addEventListener('click', (evento) => {

    const btnAddIngrediente = evento.target.closest('#btn-add-ingrediente');
    const btnAddPaso = evento.target.closest('#btn-add-paso');

    // ==========================================
    // NUEVO: LÓGICA PARA BORRAR FILAS (La famosa "X")
    // ==========================================
    if (evento.target.classList.contains('btn-eliminar')) {
        evento.preventDefault();
        // Buscamos al "padre" del botón (la fila entera) y lo aniquilamos del DOM
        evento.target.parentElement.remove();

        // Reto de profe resuelto: Actualizar los números de los placeholders de los pasos
        const textareas = document.querySelectorAll('.paso-texto');
        textareas.forEach((txt, indice) => {
            txt.placeholder = `Paso ${indice + 1}: ...`;
        });
        return; // Salimos de la función
    }

    // ==========================================
    // LÓGICA: AÑADIR INGREDIENTE (Con desplegable)
    // ==========================================
    if (btnAddIngrediente) {
        evento.preventDefault();
        const contenedor = document.getElementById('contenedor-ingredientes');
        if (!contenedor) return;

        const nuevaFila = document.createElement('div');
        nuevaFila.classList.add('fila-ingrediente');

        const inputCant = document.createElement('input');
        inputCant.type = 'text';
        inputCant.placeholder = 'Cant.';
        inputCant.classList.add('input-caja', 'ing-cant');
        inputCant.required = true;

        // --- CREACIÓN PURA DEL SELECT (¡Esto puntúa alto!) ---
        const selectMedida = document.createElement('select');
        selectMedida.classList.add('input-caja', 'ing-medida');
        selectMedida.required = true;

        // Opciones del desplegable
        const opciones = [
            { valor: '', texto: 'Unidad', deshabilitado: true },
            { valor: 'gr', texto: 'Gramos (gr)' },
            { valor: 'ml', texto: 'Mililitros (ml)' },
            { valor: 'ud', texto: 'Unidades (ud)' },
            { valor: 'cdas', texto: 'Cucharadas' },
            { valor: 'tazas', texto: 'Tazas' }
        ];

        opciones.forEach(opData => {
            const opcion = document.createElement('option');
            opcion.value = opData.valor;
            opcion.textContent = opData.texto;
            if (opData.deshabilitado) {
                opcion.disabled = true;
                opcion.selected = true;
            }
            selectMedida.appendChild(opcion);
        });

        const inputNombre = document.createElement('input');
        inputNombre.type = 'text';
        inputNombre.placeholder = 'Ingrediente';
        inputNombre.classList.add('input-caja', 'ing-nombre');
        inputNombre.required = true;

        // Botón Eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.classList.add('btn-eliminar');
        btnEliminar.textContent = 'X';

        // Ensamblaje
        nuevaFila.appendChild(inputCant);
        nuevaFila.appendChild(selectMedida);
        nuevaFila.appendChild(inputNombre);
        nuevaFila.appendChild(btnEliminar);

        contenedor.insertBefore(nuevaFila, btnAddIngrediente);
    }

    // ==========================================
    // LÓGICA: AÑADIR PASO (Con la "X")
    // ==========================================
    if (btnAddPaso) {
        evento.preventDefault();
        const contenedor = document.getElementById('contenedor-pasos');
        if (!contenedor) return;

        const pasosActuales = contenedor.querySelectorAll('.textarea-paso').length;

        // Creamos el div contenedor .fila-paso
        const divPaso = document.createElement('div');
        divPaso.classList.add('fila-paso');

        const nuevoPaso = document.createElement('textarea');
        nuevoPaso.classList.add('textarea-paso', 'paso-texto');
        nuevoPaso.placeholder = `Paso ${pasosActuales + 1}: ...`;
        nuevoPaso.required = true;

        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.classList.add('btn-eliminar');
        btnEliminar.textContent = 'X';

        divPaso.appendChild(nuevoPaso);
        divPaso.appendChild(btnEliminar);

        contenedor.insertBefore(divPaso, btnAddPaso);
    }

    // --- LÓGICA: SELECCIONAR CATEGORÍAS ---
    const etiquetaClicada = evento.target.closest('.etiqueta');
    if (etiquetaClicada) {
        evento.preventDefault();
        // El toggle hace que si no tiene la clase se la ponga, y si la tiene se la quite
        etiquetaClicada.classList.toggle('activa');
    }

    // --- LÓGICA: ABRIR SELECTOR DE FOTOS ---
    const cajaFoto = evento.target.closest('#caja-foto-visual');
    if (cajaFoto) {
        // Al hacer clic en nuestra caja bonita, simulamos un clic en el input feo y oculto
        document.getElementById('receta-imagen').click();
    }
});

// EVENTO CHANGE: Para previsualizar la foto elegida
document.addEventListener('change', (evento) => {
    if (evento.target && evento.target.id === 'receta-imagen') {
        const archivo = evento.target.files[0];

        if (archivo) {
            // Usamos FileReader para leer la imagen en el navegador
            const lector = new FileReader();

            lector.onload = function(e) {
                const cajaVisual = document.getElementById('caja-foto-visual');
                const icono = document.getElementById('icono-foto');
                const texto = document.getElementById('texto-foto');

                // Ocultamos el texto y el icono
                if (icono) icono.style.display = 'none';
                if (texto) texto.style.display = 'none';

                // Comprobamos si ya había una imagen previa y la borramos
                const imagenVieja = cajaVisual.querySelector('.img-preview');
                if (imagenVieja) {
                    cajaVisual.removeChild(imagenVieja);
                }

                // Creamos el elemento img con DOM puro
                const nuevaImagen = document.createElement('img');
                nuevaImagen.src = e.target.result; // El resultado de leer el archivo
                nuevaImagen.classList.add('img-preview');

                cajaVisual.appendChild(nuevaImagen);
            }

            lector.readAsDataURL(archivo);
        }
    }
});

// ==========================================
// EVENTO SUBMIT: Recopilar y Enviar los datos
// ==========================================
document.addEventListener('submit', (evento) => {

    // Nos aseguramos de que el submit viene de nuestro formulario
    if (evento.target && evento.target.id === 'formulario-nueva-receta') {
        evento.preventDefault(); // Evitamos que la página se recargue

        // 1. Recolección de datos simples
        const titulo = document.getElementById('receta-titulo').value;
        const tiempo = document.getElementById('receta-tiempo').value;
        const raciones = document.getElementById('receta-raciones').value;
        const dificultad = document.getElementById('receta-dificultad').value;
        const descripcion = document.getElementById('receta-desc').value;

        // 2. Recolección de CATEGORÍAS (¡Aquí está el paso C!)
        const arrayCategorias = [];
        // Buscamos solo los botones que tengan la clase 'activa' (los que están en rojo)
        document.querySelectorAll('.etiqueta.activa').forEach(boton => {
            arrayCategorias.push(boton.textContent);
        });

        // 3. Recolección de Ingredientes
        const arrayIngredientes = [];
        document.querySelectorAll('.fila-ingrediente').forEach(fila => {
            const cant = fila.querySelector('.ing-cant').value;
            const medida = fila.querySelector('.ing-medida').value; // Ahora esto lee el <select>
            const nombre = fila.querySelector('.ing-nombre').value;

            // Solo lo guardamos si al menos han puesto el nombre del ingrediente
            if (nombre) {
                // Formateamos: "200 gr de Harina"
                arrayIngredientes.push(`${cant} ${medida} de ${nombre}`.trim());
            }
        });

        // 4. Recolección de Pasos
        const arrayPasos = [];
        document.querySelectorAll('.paso-texto').forEach(textarea => {
            if (textarea.value.trim() !== '') {
                arrayPasos.push(textarea.value.trim());
            }
        });

        // 5. Construir el objeto JSON final
        const nuevaReceta = {
            titulo: titulo,
            tiempo: tiempo,
            raciones: parseInt(raciones), // Lo guardamos como número
            dificultad: dificultad,
            categorias: arrayCategorias, // <- Aquí añadimos el array de etiquetas
            descripcion: descripcion,
            ingredientes: arrayIngredientes,
            instrucciones: arrayPasos,
            // Nota: La imagen real requiere un servidor que acepte archivos.
            // Para JSON-server usamos un placeholder o la URL base64 si es muy pequeña.
            // Por ahora ponemos un string estático para no romper la BD.
            imagen: "assets/img/receta-placeholder.jpg",
            estrellas: 0
        };

        console.log("Datos listos para enviar:", nuevaReceta);

        // 6. Fetch usando Promesas puras (.then y .catch) para el fake server
        fetch('http://localhost:3000/recetas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaReceta)
        })
            .then(res => {
                if (res.ok) {
                    alert('¡Receta subida con éxito al servidor! 👨‍🍳');
                    evento.target.reset(); // Vaciamos el formulario

                    // Limpiamos la previsualización de la foto y las categorías
                    document.querySelectorAll('.etiqueta.activa').forEach(btn => btn.classList.remove('activa'));
                    const cajaVisual = document.getElementById('caja-foto-visual');
                    const imagenVieja = cajaVisual.querySelector('.img-preview');
                    if (imagenVieja) cajaVisual.removeChild(imagenVieja);
                    document.getElementById('icono-foto').style.display = 'block';
                    document.getElementById('texto-foto').style.display = 'block';

                } else {
                    console.error('Error en el servidor al subir la receta');
                }
            })
            .catch(error => console.error('Error de red enviando receta:', error));
    }
});