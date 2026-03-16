// js/subir_receta.js

// CHIVATO 1: Verificamos que el archivo JS se ha cargado correctamente en el HTML
console.log("✅ ARCHIVO subir_receta.js CARGADO CORRECTAMENTE");

document.addEventListener('click', (evento) => {
    // CHIVATO 2: Verificamos que el documento detecta TODOS los clics
    // (Abre la consola y haz clic en cualquier parte de la página, deberías ver esto)
    // console.log("Clic en:", evento.target); // Lo dejo comentado para que no te inunde la consola, pero funciona

    const btnAddIngrediente = evento.target.closest('#btn-add-ingrediente');
    const btnAddPaso = evento.target.closest('#btn-add-paso');

    // ==========================================
    // LÓGICA: AÑADIR INGREDIENTE
    // ==========================================
    if (btnAddIngrediente) {
        evento.preventDefault();
        console.log("🔥 CHIVATO 3: ¡Has hecho clic en el botón de añadir INGREDIENTE!");

        const contenedor = document.getElementById('contenedor-ingredientes');

        if (!contenedor) {
            console.error("❌ ERROR: No encuentro el div con id='contenedor-ingredientes'. Revisa tu HTML.");
            return;
        }

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
        console.log("✅ Fila de ingrediente insertada con éxito.");
    }

    // ==========================================
    // LÓGICA: AÑADIR PASO
    // ==========================================
    if (btnAddPaso) {
        evento.preventDefault();
        console.log("🔥 CHIVATO 4: ¡Has hecho clic en el botón de añadir PASO!");

        const contenedor = document.getElementById('contenedor-pasos');

        if (!contenedor) {
            console.error("❌ ERROR: No encuentro el div con id='contenedor-pasos'. Revisa tu HTML.");
            return;
        }

        const pasosActuales = contenedor.querySelectorAll('.paso-texto').length;

        const nuevoPaso = document.createElement('textarea');
        nuevoPaso.classList.add('textarea-paso', 'paso-texto');
        nuevoPaso.placeholder = `Paso ${pasosActuales + 1}: ...`;
        nuevoPaso.required = true;

        contenedor.insertBefore(nuevoPaso, btnAddPaso);
        console.log("✅ Paso insertado con éxito.");
    }
});