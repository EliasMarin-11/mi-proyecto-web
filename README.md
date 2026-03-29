# Mi_Proyecto_Web - Sprint 2

## What's in your fridge

Este proyecto en grupo trata de una página web de recetas donde los usuarios pueden buscar ideas sobre qué cocinar, subir sus propios platos y guardar sus recetas favoritas.

**El grupo está formado por:**
* Elías Marín Otero
* Pablo Campos Rico
* Alejandro Mentado García

### Estructura del Proyecto

Para este Sprint 2, hemos evolucionado la arquitectura del proyecto hacia un modelo modular, separando responsabilidades para que el código sea mucho más limpio y escalable. En la raíz del proyecto se encuentran las páginas principales HTML (Inicio, Buscador, Favoritos, Login, Perfil, etc.), apoyadas por las siguientes carpetas:

* **`data/`**: Contiene nuestro archivo `db.json`, que actúa como nuestra base de datos centralizada simulando un entorno backend (almacenando recetas, usuarios con sus roles y alérgenos).
* **`js/`**: Hemos dividido la lógica en scripts modulares. Además de un `main.js` y `layout.js` para la funcionalidad global, tenemos archivos dedicados para cada sección (`auth.js` para sesiones, `buscador.js`, `favoritos.js`, etc.).
* **`css/`**: Hemos pasado de tener solo un `MAIN.css` a una estructura de estilos modulares. Cada componente (header, footer, tarjetas) y cada página tiene su propio archivo CSS independiente.
* **`templates/`**: Contiene todas las plantillas HTML (componentes como el header, el footer, los formularios y las tarjetas de recetas) que ahora se inyectan dinámicamente en las páginas mediante JavaScript.
* **`mockups/`**: Contiene los diseños iniciales en formato PNG. Para este sprint, hemos añadido las subcarpetas `responsive_movil` y `responsive_tablet` para planificar la adaptación a todos los dispositivos.
* **`img/`**: Almacena todos los recursos gráficos clasificados (iconos de la app, avatares, fotos de recetas e iconografía de alérgenos).
* **`recursos/`**: Carpeta destinada a guardar los entregables de la asignatura (presentaciones, vídeos y el empaquetado del proyecto).

### Novedades del Desarrollo (Sprint 2)

En este segundo sprint hemos pasado de un diseño estático a una aplicación web completamente interactiva del lado del cliente. 

* **Base de Datos y DOM:** Consumo de datos en tiempo real desde nuestro `db.json` utilizando la API `fetch` y `Promise.all` para combinar los datos con las plantillas de la carpeta `templates/` e inyectarlos en el DOM.
* **Gestión de Sesiones:** Implementación de `localStorage` para diferenciar entre usuarios invitados, básicos y premium, permitiendo o bloqueando el acceso a funcionalidades como "Subir Receta".
* **Diseño Responsive:** Adaptación total de la web a dispositivos móviles y tablets mediante Media Queries, incluyendo menús de navegación tipo hamburguesa y carruseles táctiles.

### Tecnologías utilizadas

Este proyecto sigue construido con lenguajes base (Vanilla), demostrando que se pueden lograr resultados profesionales sin depender de frameworks externos complejos:

* **HTML5:** Para crear la estructura semántica de las páginas y aprovechar la **validación nativa** en todos los formularios (uso de atributos como `required`, `type="email"`, `minlength`).
* **CSS3:** Para la maquetación (Flexbox), variables de color, estados interactivos y el diseño **Responsive**.
* **Vanilla JavaScript (ES6):** Para toda la lógica de negocio, manejo de asincronía (Promesas), manipulación del DOM y persistencia de datos en el navegador.

### Recursos Adjuntos

* [Descargar Proyecto (WebStorm ZIP)](#)
* [Presentación del Proyecto (PDF)](#)
* [Video del Proyecto (mp4)](#)

> *Proyecto creado para la asignatura de Programación Web y Móvil.*
