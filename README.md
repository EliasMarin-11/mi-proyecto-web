# Mi Proyecto Web - Sprint 3

## What's in your fridge

Este proyecto grupal es una web de recetas donde la gente puede buscar ideas para cocinar, subir sus propios platos y guardarse sus favoritos.

**El equipo:**
* Elías Marín Otero
* Pablo Campos Rico
* Alejandro Mentado García

### Lo nuevo del Sprint 3

En este tercer sprint le hemos dado una vuelta de tuerca importante al proyecto. Hemos dejado atrás el código "Vanilla" del Sprint 2 y hemos migrado toda la web a **Angular**. Además, ahora usamos **Firebase** como nuestro backend real, lo que cambia por completo cómo funciona la app por dentro.

Esto es lo principal que hemos cambiado:

* **Todo a Angular:** Hemos reescrito la app completa usando componentes de Angular. Ahora es una *Single Page Application* (SPA), así que la navegación es mucho más fluida.
* **Firebase al mando:**
    * **Usuarios:** El registro y el login ahora van directos contra Firebase Auth.
    * **Base de datos (Firestore):** Adiós al `db.json` local. Todas las recetas, ingredientes y reseñas se guardan y leen en tiempo real desde Firebase.
    * **Fotos:** Cuando alguien sube una receta, la imagen va a Firebase Storage y guardamos el enlace en Firestore para mostrarla luego.
* **Formularios serios:** Hemos usado las herramientas de Angular para hacer formularios de verdad, validando que la gente meta bien los datos al registrarse o al subir una receta.
* **Código más limpio (Servicios):** Hemos sacado toda la lógica complicada (las llamadas a Firebase, el login) a archivos separados (`auth.ts` y `recetas.service.ts`) para que los componentes queden más limpios.
* **Sigue siendo Responsive:** Por supuesto, la web se sigue viendo perfecta tanto en el móvil como en el ordenador.

### Cómo está montado el código ahora

Al pasarnos a Angular, la estructura ha cambiado bastante. Casi todo lo importante está dentro de la carpeta `src/`.

* **`src/app/`**: Aquí están las páginas enteras (Inicio, Buscador, Favoritos, Login...) y el archivo `app.routes.ts` que decide qué página enseñar en cada momento.
* **`src/app/components/`**: Los "bloques de lego" de la web. Aquí están el Header, el Footer, las tarjetitas de las recetas, los formularios, etc. Los hemos separado para poder reutilizarlos fácil.
* **`src/app/services/`**: Los "cerebros" de la app.
    * `auth.ts`: Se encarga de saber quién está logueado y de hablar con Firebase Auth.
    * `recetas.service.ts`: Es el que va a Firestore a buscar las recetas, aplicar los filtros del buscador y guardar los favoritos.
* **`public/`**:
    * **`img/`**: Todas las imágenes, iconos de alérgenos y logos.
    * **`data/`**: Hemos dejado aquí los archivos JSON (`db.json`, `ingredientes.json`) porque eran un paso obligatorio de la práctica antes de pasarlo todo a Firebase.

### Qué tecnologías hemos usado

* **Angular:** Como framework principal para montar todo el frontend.
* **TypeScript:** Porque Angular lo pide, y nos ayuda a no liarla con los tipos de datos.
* **Firebase:**
    * **Auth:** Para gestionar las sesiones.
    * **Firestore:** Nuestra base de datos NoSQL.
    * **Storage:** Para guardar las fotos.
* **HTML5 & CSS3:** Para que todo se vea bien y se adapte a las pantallas.

> *Proyecto creado para la asignatura de Programación Web y Móvil.*