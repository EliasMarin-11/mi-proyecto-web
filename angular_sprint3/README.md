# Mi_Proyecto_Web - Sprint 3

## What's in your fridge

Este proyecto en grupo trata de una aplicación web moderna de recetas donde los usuarios pueden buscar ideas sobre qué cocinar, subir sus propios platos interactuando con una base de datos real, y dejar sus valoraciones en la comunidad.

**El grupo está formado por:**
* Elías Marín Otero
* Pablo Campos Rico
* Alejandro Mentado García

### Estructura del Proyecto

Para este Sprint 3, hemos dado un gran salto arquitectónico. Hemos dejado atrás los scripts sueltos y el archivo `db.json` para adoptar una estructura profesional basada en componentes utilizando el framework **Angular**. El proyecto ahora es mucho más robusto, organizado y escalable. La estructura principal dentro de la carpeta `src/app/` es la siguiente:

* **`components/`**: Contiene todos los "bloques de Lego" visuales de nuestra web (tarjetas de receta, buscador, formularios, perfil de usuario, etc.). Cada componente tiene su propio HTML, CSS y archivo TypeScript (`.ts`) independiente.
* **`services/`**: Aquí centralizamos el "cerebro" de la aplicación. Tenemos archivos como `recetas.service.ts` y `auth.service.ts` que se encargan de hablar con la base de datos y gestionar las sesiones, separando la lógica visual de los datos.
* **Diseño e Interfaz**: Seguimos fieles a nuestros mockups originales (homepage, recetas guardadas, buscador, ver receta en detalle, crear receta, perfil, mi despensa virtual, etc.), adaptando la interfaz a un diseño totalmente interactivo con CSS Grid para apilar elementos de forma profesional.

### Novedades del Desarrollo (Sprint 3)

En este tercer sprint hemos migrado completamente la lógica a un entorno profesional, conectando la web a servicios reales en la nube:

* **Base de Datos en la Nube (Firebase Firestore):** Hemos migrado nuestros datos locales a la nube. Ahora la carga de ingredientes sugeridos, la creación de recetas y el guardado de datos se hacen en tiempo real en internet.
* **Autenticación y Sesiones Reales:** Hemos sustituido el `localStorage` temporal por un sistema de cuentas de usuario real con Firebase Auth. Los usuarios inician sesión de verdad, y sus recetas, fotos de perfil y comentarios se vinculan a su identidad.
* **Buscador Inteligente y Filtros Avanzados:** Hemos mejorado el buscador para que no solo encuentre texto, sino que permita usar filtros automáticos por dificultad y duración de la receta.
* **Interacción Social Completa:** La comunidad ha cobrado vida. Los usuarios pueden dejar comentarios con sus propias fotos de perfil (avatares) y votar las recetas. El sistema calcula matemáticamente la media de estrellas.
* **Control Total del Usuario (CRUD):** Aplicando una buena **praxis** de seguridad y usabilidad, los creadores de contenido ahora tienen control total para publicar, leer, editar y borrar sus propias recetas directamente desde la interfaz de la web de forma segura.

### Cómo iniciar el proyecto en local

Para ejecutar este proyecto en tu propio ordenador y probar todas sus funcionalidades, sigue estos sencillos pasos:

1. **Requisitos previos:** Asegúrate de tener instalado [Node.js](https://nodejs.org/) y Angular CLI (`npm install -g @angular/cli`) en tu equipo.
2. **Descomprimir y acceder:** Extrae el contenido del archivo ZIP adjunto y abre una terminal (o consola de comandos). Navega hasta la **carpeta raíz del proyecto** (es la carpeta que contiene el archivo `package.json`).
3. **Instalar dependencias:** Ejecuta el comando `npm install` para que se descarguen todas las librerías necesarias de Angular y Firebase.
4. **Levantar el servidor:** Ejecuta el comando `ng serve -o`. Esto compilará el proyecto y lo abrirá automáticamente en tu navegador web por defecto (en `http://localhost:4200`).

### Tecnologías utilizadas

Hemos modernizado nuestro *stack* tecnológico para este sprint, demostrando capacidad de adaptación a herramientas muy demandadas en el mundo laboral:

* **Angular:** Como framework principal para crear una aplicación rápida (Single Page Application), utilizando componentes independientes y un sistema de rutas dinámico.
* **TypeScript:** Hemos sustituido JavaScript por TypeScript para escribir un código mucho más estricto, seguro y limpio. Usamos "moldes" (Interfaces) para evitar errores con los datos.
* **Firebase:** Actúa como nuestro servidor en la nube (Backend). Usamos Firestore para guardar la información y Firebase Auth para controlar quién entra en la web.
* **HTML5 y CSS3:** Mantenemos un diseño impecable con validaciones de formulario nativas y técnicas avanzadas como Flexbox y CSS Grid para asegurar que la web se vea perfecta tanto en móviles como en ordenadores.

### Recursos Adjuntos

* [Descargar Proyecto (WebStorm ZIP)](recursos/proyecto_sprint3.zip)
* [Presentación del Proyecto (PDF)](recursos/presentacion_sprint3.pdf)
* [Video del Proyecto (mp4)](recursos/video_sprint3.mp4)

> *Proyecto creado para la asignatura de Programación Web y Móvil.*
