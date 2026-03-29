document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('submit', (e) => {

        if (e.target && e.target.id === 'form-login') {
            e.preventDefault();

            const emailIntroducido = document.getElementById('emailLogin').value.trim();
            const passIntroducida = document.getElementById('passLogin').value.trim();

            fetch('data/db.json')
                .then(response => response.json())
                .then(data => {
                    let usuarioEncontrado = data.usuarios.find(u =>
                        u.email === emailIntroducido && u.password === passIntroducida
                    );

                    if (!usuarioEncontrado) {
                        const usuariosNuevos = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
                        usuarioEncontrado = usuariosNuevos.find(u =>
                            u.email === emailIntroducido && u.password === passIntroducida
                        );
                    }

                    if (usuarioEncontrado) {
                        localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioEncontrado));
                        alert(`¡Bienvenido/a de nuevo, ${usuarioEncontrado.nombre}! 👨‍🍳`);
                        window.location.href = 'index.html';
                    } else {
                        alert("❌ Email o contraseña incorrectos. Revisa los datos.");
                    }
                })
                .catch(error => console.error("Error al leer la base de datos de usuarios:", error));
        }

        if (e.target && e.target.classList.contains('formulario-registro')) {
            e.preventDefault();

            const formRegistro = e.target;
            const nombre = formRegistro.querySelector('[name="nombre"]').value.trim();
            const correo = formRegistro.querySelector('[name="correo"]').value.trim();
            const contrasena = formRegistro.querySelector('[name="contrasena"]').value.trim();
            const confirmarContrasena = formRegistro.querySelector('[name="confirmar_contrasena"]').value.trim();

            if (contrasena !== confirmarContrasena) {
                alert('¡Ojo! Las contraseñas no coinciden. Vuelve a escribirlas.');
                return;
            }

            const nuevoUsuario = {
                nombre: nombre,
                email: correo,
                password: contrasena,
                premium: false
            };

            const usuariosNuevos = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
            usuariosNuevos.push(nuevoUsuario);
            localStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosNuevos));

            localStorage.setItem('usuarioLogueado', JSON.stringify(nuevoUsuario));

            alert('¡Brutal, ' + nombre + '! Tu cuenta está lista.');
            window.location.href = 'index.html';
        }
    });
});