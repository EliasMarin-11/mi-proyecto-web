let imagenSubida = null;

document.addEventListener('click', (evento) => {
    const btnAddIngrediente = evento.target.closest('#btn-add-ingrediente');
    const btnAddPaso = evento.target.closest('#btn-add-paso');

    // Eliminar fila dinámica
    if (evento.target.classList.contains('btn-eliminar')) {
        evento.preventDefault();
        evento.target.parentElement.remove();

        // Actualización de índices en placeholders
        const textareas = document.querySelectorAll('.paso-texto');
        textareas.forEach((txt, indice) => {
            txt.placeholder = `Paso ${indice + 1}: ...`;
        });
        return;
    }

    // Eliminar foto principal con confirmación
    if (evento.target.classList.contains('btn-borrar-foto')) {
        evento.preventDefault();
        evento.stopPropagation();

        if (confirm('¿Seguro que quieres quitar la foto?')) {
            imagenSubida = null;
            document.getElementById('receta-imagen').value = '';
            actualizarVistaFoto();
        }
        return;
    }

    // Insertar fila de ingrediente
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

        const selectMedida = document.createElement('select');
        selectMedida.classList.add('input-caja', 'ing-medida');
        selectMedida.required = true;

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

        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.classList.add('btn-eliminar');
        btnEliminar.textContent = 'X';

        nuevaFila.appendChild(inputCant);
        nuevaFila.appendChild(selectMedida);
        nuevaFila.appendChild(inputNombre);
        nuevaFila.appendChild(btnEliminar);

        contenedor.insertBefore(nuevaFila, btnAddIngrediente);
    }

    // Insertar fila de paso
    if (btnAddPaso) {
        evento.preventDefault();
        const contenedor = document.getElementById('contenedor-pasos');
        if (!contenedor) return;

        const pasosActuales = contenedor.querySelectorAll('.textarea-paso').length;

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

    // Seleccionar/Deseleccionar categorías
    const etiquetaClicada = evento.target.closest('.etiqueta');
    if (etiquetaClicada) {
        evento.preventDefault();
        etiquetaClicada.classList.toggle('activa');
    }

    // Abrir selector de fotos nativo
    const cajaFoto = evento.target.closest('#caja-foto-visual');
    if (cajaFoto && !evento.target.classList.contains('btn-borrar-foto')) {
        document.getElementById('receta-imagen').click();
    }
});

// Procesamiento de imagen
document.addEventListener('change', (evento) => {
    if (evento.target && evento.target.id === 'receta-imagen') {
        const archivo = evento.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = function(e) {
            imagenSubida = e.target.result;
            actualizarVistaFoto();
        }
        lector.readAsDataURL(archivo);

        evento.target.value = '';
    }
});

function actualizarVistaFoto() {
    const cajaFoto = document.getElementById('caja-foto-visual');
    const icono = document.getElementById('icono-foto');
    const texto = document.getElementById('texto-foto');

    if (!cajaFoto) return;


    const previewExistente = cajaFoto.querySelector('.img-preview');
    const btnBorrarExistente = cajaFoto.querySelector('.btn-borrar-foto');
    if (previewExistente) previewExistente.remove();
    if (btnBorrarExistente) btnBorrarExistente.remove();

    if (imagenSubida) {
        if (icono) icono.style.display = 'none';
        if (texto) texto.style.display = 'none';

        const img = document.createElement('img');
        img.src = imagenSubida;
        img.classList.add('img-preview');

        const btnBorrar = document.createElement('button');
        btnBorrar.type = 'button';
        btnBorrar.classList.add('btn-borrar-foto');
        btnBorrar.textContent = 'X';
        btnBorrar.title = 'Eliminar foto';

        cajaFoto.appendChild(img);
        cajaFoto.appendChild(btnBorrar);
    } else {
        if (icono) icono.style.display = 'block';
        if (texto) texto.style.display = 'block';
    }
}

// Envío del formulario
document.addEventListener('submit', (evento) => {
    if (evento.target && evento.target.id === 'formulario-nueva-receta') {
        evento.preventDefault();

        const titulo = document.getElementById('receta-titulo').value;
        const tiempo = document.getElementById('receta-tiempo').value;
        const raciones = document.getElementById('receta-raciones').value;
        const dificultad = document.getElementById('receta-dificultad').value;
        const descripcion = document.getElementById('receta-desc').value;

        const arrayCategorias = [];
        document.querySelectorAll('.etiqueta.activa').forEach(boton => {
            arrayCategorias.push(boton.textContent);
        });

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
            raciones: parseInt(raciones),
            dificultad: dificultad,
            categorias: arrayCategorias,
            descripcion: descripcion,
            ingredientes: arrayIngredientes,
            instrucciones: arrayPasos,
            imagen: imagenSubida ? imagenSubida : "assets/img/receta-placeholder.jpg",
            estrellas: 0
        };

        fetch('http://localhost:3000/recetas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaReceta)
        })
            .then(res => {
                if (res.ok) {
                    alert('¡Receta subida con éxito al servidor! 👨‍🍳');
                    evento.target.reset();

                    document.querySelectorAll('.etiqueta.activa').forEach(btn => btn.classList.remove('activa'));

                    imagenSubida = null;
                    actualizarVistaFoto();
                } else {
                    console.error('Error en el servidor al subir la receta');
                }
            })
            .catch(error => console.error('Error de red enviando receta:', error));
    }
});