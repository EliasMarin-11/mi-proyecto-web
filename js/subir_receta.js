let imagenSubida = null;
let ingredientesValidos = new Set();

document.addEventListener('DOMContentLoaded', () => {
    fetch('data/db.json')
        .then(res => res.json())
        .then(data => {
            data.recetas.forEach(receta => {
                receta.ingredientes_clave.forEach(ing => ingredientesValidos.add(ing.toLowerCase()));
            });
        })
        .catch(error => console.error(error));
});

document.addEventListener('click', (evento) => {
    const btnAddIngrediente = evento.target.closest('#btn-add-ingrediente');
    const btnAddPaso = evento.target.closest('#btn-add-paso');

    if (evento.target.classList.contains('btn-eliminar')) {
        evento.preventDefault();
        evento.target.parentElement.remove();

        const textareas = document.querySelectorAll('.paso-texto');
        textareas.forEach((txt, indice) => {
            txt.placeholder = `Paso ${indice + 1}: ...`;
        });
        return;
    }

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

    if (btnAddIngrediente) {
        evento.preventDefault();
        const contenedor = document.getElementById('contenedor-ingredientes');
        if (!contenedor) return;

        const nuevaFila = document.createElement('div');
        nuevaFila.classList.add('fila-ingrediente');

        const inputCant = document.createElement('input');
        inputCant.type = 'number';
        inputCant.step = 'any';
        inputCant.min = '0';
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

    const etiquetaClicada = evento.target.closest('.etiqueta');
    if (etiquetaClicada) {
        evento.preventDefault();
        etiquetaClicada.classList.toggle('activa');
    }

    const cajaFoto = evento.target.closest('#caja-foto-visual');
    if (cajaFoto && !evento.target.classList.contains('btn-borrar-foto')) {
        document.getElementById('receta-imagen').click();
    }
});

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

document.addEventListener('submit', (evento) => {
    if (evento.target && evento.target.id === 'formulario-nueva-receta') {
        evento.preventDefault();

        let validacionFallida = false;
        let ingredienteErroneo = "";

        const titulo = document.getElementById('receta-titulo').value;

        // --- CAMBIO 1: Leer el tiempo en dos partes y juntarlo ---
        const tiempoNum = document.getElementById('receta-tiempo-num').value;
        const tiempoUnidad = document.getElementById('receta-tiempo-unidad').value;
        const tiempo = tiempoNum + " " + tiempoUnidad; // Resultado: "45 min" o "2 horas"

        const raciones = document.getElementById('receta-raciones').value;
        const dificultad = document.getElementById('receta-dificultad').value;
        const descripcion = document.getElementById('receta-desc').value;

        // --- CAMBIO 2: Crear el array buscando los alérgenos seleccionados ---
        const arrayAlergenos = [];
        document.querySelectorAll('#contenedor-alergenos .etiqueta.activa').forEach(boton => {
            arrayAlergenos.push(boton.textContent.trim());
        });

        const arrayDieta = [];
        document.querySelectorAll('#contenedor-dieta .etiqueta.activa').forEach(boton => {
            let valor = boton.textContent.toLowerCase().replace(' ', '');
            arrayDieta.push(valor);
        });

        let tipoPlatoSeleccionado = "";
        const etiquetaTipo = document.querySelector('#contenedor-tipo .etiqueta.activa');
        if (etiquetaTipo) {
            tipoPlatoSeleccionado = etiquetaTipo.textContent.toLowerCase();
        }

        const arrayIngredientes = [];
        const arrayIngredientesClave = [];

        document.querySelectorAll('.fila-ingrediente').forEach(fila => {
            const cant = fila.querySelector('.ing-cant').value;
            const medida = fila.querySelector('.ing-medida').value;
            const nombre = fila.querySelector('.ing-nombre').value.trim();

            if (nombre) {
                if (!ingredientesValidos.has(nombre.toLowerCase())) {
                    validacionFallida = true;
                    ingredienteErroneo = nombre;
                }
                arrayIngredientes.push(`${cant} ${medida} de ${nombre}`);
                arrayIngredientesClave.push(nombre.toLowerCase());
            }
        });

        if (validacionFallida) {
            alert(`El ingrediente "${ingredienteErroneo}" no está en nuestra base de datos. Por favor, usa ingredientes válidos.`);
            return;
        }

        const arrayPasos = [];
        document.querySelectorAll('.paso-texto').forEach(textarea => {
            if (textarea.value.trim() !== '') {
                arrayPasos.push(textarea.value.trim());
            }
        });

        const nuevaReceta = {
            titulo: titulo,
            imagen: imagenSubida ? imagenSubida : "assets/img/receta-placeholder.jpg",
            tiempo: tiempo,
            duracion_categoria: tiempo,
            dificultad: dificultad,
            raciones: parseInt(raciones),
            estrellas: 0,
            tipo_plato: tipoPlatoSeleccionado,
            dieta: arrayDieta,
            descripcion: descripcion,
            alergenos: arrayAlergenos,
            ingredientes_clave: arrayIngredientesClave,
            ingredientes: arrayIngredientes,
            instrucciones: arrayPasos,
            enlace: "#",
            reseñas: []
        };

        // --- MAGIA LOCALSTORAGE (Sustituye al Fetch) ---

        // 1. Le generamos un ID numérico único basado en la fecha
        nuevaReceta.id = parseInt(Date.now().toString().slice(-6));

        // 2. Leemos lo que ya hay guardado en el navegador
        const misRecetasStr = localStorage.getItem('misRecetasCreadas');
        const misRecetasArray = misRecetasStr ? JSON.parse(misRecetasStr) : [];

        // 3. Metemos la nueva receta en la lista
        misRecetasArray.push(nuevaReceta);

        // 4. Volvemos a guardar la lista entera
        localStorage.setItem('misRecetasCreadas', JSON.stringify(misRecetasArray));

        alert('¡Receta creada con éxito! 👨‍🍳 Se ha guardado en tu perfil.');

        // 5. Limpiamos el formulario
        evento.target.reset();
        document.querySelectorAll('.etiqueta.activa').forEach(btn => btn.classList.remove('activa'));
        imagenSubida = null;
        actualizarVistaFoto();

        // 6. Redirigimos al perfil para ver la receta creada
        window.location.href = 'PERFIL.html';
    }
});