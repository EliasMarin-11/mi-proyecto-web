document.addEventListener('DOMContentLoaded', () => {
    // 1. Esperamos a que el template de login se cargue
    const intentarConectarForm = setInterval(() => {
        const formulario = document.getElementById('form-login');

        if (formulario) {
            clearInterval(intentarConectarForm);
            console.log("✅ Sistema de autenticación conectado al formulario");

            formulario.addEventListener('submit', (e) => {
                e.preventDefault(); // Evitamos que la página se recargue

                const emailIntroducido = document.getElementById('emailLogin').value;
                const passIntroducida = document.getElementById('passLogin').value;

                // 2. Consultamos nuestra "Base de Datos"
                fetch('data/db.json')
                    .then(response => response.json())
                    .then(data => {
                        const usuarioEncontrado = data.usuarios.find(u =>
                            u.email === emailIntroducido && u.password === passIntroducida
                        );

                        if (usuarioEncontrado) {
                            alert("¡Bienvenido/a " + usuarioEncontrado.nombre + "!");
                            // Guardamos la sesión (Tarea 2.3)
                            localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioEncontrado));
                            // Redirigimos al inicio
                            window.location.href = 'index.html';
                        } else {
                            alert("❌ Email o contraseña incorrectos. Revisa los datos.");
                        }
                    })
                    .catch(error => console.error("Error al leer usuarios:", error));
            });
        }
    }, 100);
});