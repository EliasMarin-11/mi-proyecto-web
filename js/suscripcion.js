document.addEventListener('DOMContentLoaded', () => {

    function inicializarSuscripcion() {
        const btnBasico = document.querySelector('.plan-basico .btn-plan');
        const btnPremium = document.querySelector('.plan-premium .btn-plan');

        if (btnBasico && btnPremium) {
            asignarEventosSuscripcion(btnBasico, 'basico');
            asignarEventosSuscripcion(btnPremium, 'premium');
        } else {
            setTimeout(inicializarSuscripcion, 50);
        }
    }

    inicializarSuscripcion();
});

function asignarEventosSuscripcion(boton, rolDestino) {
    boton.addEventListener('click', (e) => {
        e.preventDefault();

        const usuarioJson = localStorage.getItem('usuarioLogueado');

        if (!usuarioJson) {
            alert("Debes iniciar sesión para elegir un plan.");
            window.location.href = "index.html";
            return;
        }

        const usuario = JSON.parse(usuarioJson);

        if (usuario.rol === rolDestino) {
            alert(`Ya disfrutas de las ventajas del plan ${rolDestino.toUpperCase()}.`);
            return;
        }

        usuario.rol = rolDestino;
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));

        alert(`¡Felicidades! Has cambiado tu plan a ${rolDestino.toUpperCase()}.`);

        if (typeof gestionarSesion === 'function') {
            gestionarSesion();
        }

        window.location.href = "PERFIL.html";
    });
}