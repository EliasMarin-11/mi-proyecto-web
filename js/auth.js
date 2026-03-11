//autentificación
document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('submit', (e) => {
        // Comprobamos si el elemento que lanzó el submit es nuestro formulario de login
        if (e.target && e.target.id === 'form-login') {

            //Evitamos que la página se recargue al enviar el formulario
            e.preventDefault();

            //Cogemos los valores que ha escrito el usuario
            const emailIntroducido = document.getElementById('emailLogin').value.trim();
            const passIntroducida = document.getElementById('passLogin').value.trim();

            //Consultamos nuestra "Base de Datos" (fichero JSON)
            fetch('data/db.json')
                .then(response => response.json())
                .then(data => {
                    // Buscamos si hay un usuario con ese email y esa contraseña exacta
                    const usuarioEncontrado = data.usuarios.find(u =>
                        u.email === emailIntroducido && u.password === passIntroducida
                    );

                    if (usuarioEncontrado) {
                        localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioEncontrado));
                        alert(`¡Bienvenido/a de nuevo, ${usuarioEncontrado.nombre}! 👨‍🍳`);

                        // Redirigimos a la página principal
                        window.location.href = 'index.html';
                    } else {
                        alert("❌ Email o contraseña incorrectos. Revisa los datos.");
                    }
                })
                .catch(error => console.error("Error al leer la base de datos de usuarios:", error));
        }
    });
});