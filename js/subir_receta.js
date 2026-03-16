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
});