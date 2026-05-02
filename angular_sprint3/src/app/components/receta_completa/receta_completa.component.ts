import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // Añadido Router
import { RecetasService, Receta } from '../../services/recetas.service';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-receta_completa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receta_completa.component.html',
  styleUrl: './receta_completa.component.css'
})
export class Receta_completaComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router); // Para poder navegar al formulario
  private recetasService = inject(RecetasService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private firestore = inject(Firestore);

  receta: Receta | undefined;
  cargando = true;
  nuevoComentario: string = '';
  unsubscribe: any;

  usuarioActualId: string | null = null;
  usuarioActualNombre: string = '';

  esPropietario = false;
  usuarioYaComento = false;
  mediaEstrellas = 0;
  totalVotos = 0;
  estrellasSeleccionadas = 0;

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.usuarioActualId = user.uid;
        this.usuarioActualNombre = user.displayName || user.email?.split('@')[0] || 'Chef Anónimo';
      } else {
        this.usuarioActualId = null;
        this.usuarioActualNombre = '';
      }
      this.comprobarEstadoUsuario();
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.escucharRecetaEnTiempoReal(id);
      }
    });
  }

  escucharRecetaEnTiempoReal(id: string) {
    this.cargando = true;
    const recetaRef = doc(this.firestore, `recetas/${id}`);

    this.unsubscribe = onSnapshot(recetaRef, (docSnap) => {
      if (docSnap.exists()) {
        this.receta = { id: docSnap.id, ...docSnap.data() } as Receta;
        this.calcularMediaEstrellas();
        this.comprobarEstadoUsuario();
      }
      this.cargando = false;
      this.cdr.detectChanges();
    });
  }

  calcularMediaEstrellas() {
    if (!this.receta || !this.receta.valoraciones || this.receta.valoraciones.length === 0) {
      this.mediaEstrellas = 0;
      this.totalVotos = 0;
      return;
    }
    const valoraciones = this.receta.valoraciones;
    this.totalVotos = valoraciones.length;
    const sumaPuntos = valoraciones.reduce((sum, v) => sum + v.puntuacion, 0);
    this.mediaEstrellas = Math.round((sumaPuntos / this.totalVotos) * 10) / 10;
  }

  comprobarEstadoUsuario() {
    if (this.receta && this.usuarioActualId) {
      this.esPropietario = this.receta.userId === this.usuarioActualId;

      // Comprobamos si el ID del usuario ya está dentro de los comentarios de la receta
      const comentariosArray = this.receta.comentarios || [];
      this.usuarioYaComento = comentariosArray.some(c => c.usuarioId === this.usuarioActualId);

    } else {
      this.esPropietario = false;
      this.usuarioYaComento = false;
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

// --- SOCIAL ---
  puntuacionFija = 0; // <--- NUEVA VARIABLE para guardar las estrellas seleccionadas antes de publicar

  hoverEstrella(numero: number) {
    if (this.esPropietario) return;
    this.estrellasSeleccionadas = numero;
    this.cdr.detectChanges();
  }

  resetEstrellas() {
    // Al quitar el ratón, vuelve a la puntuación que el usuario hubiera fijado con el clic
    this.estrellasSeleccionadas = this.puntuacionFija;
    this.cdr.detectChanges();
  }

  seleccionarPuntuacion(numero: number) {
    if (this.esPropietario) return;
    this.puntuacionFija = numero; // Fijamos la puntuación
    this.estrellasSeleccionadas = numero;
    this.cdr.detectChanges();
  }

  async publicarResena() {
    if (!this.usuarioActualId) {
      alert("¡Inicia sesión para reseñar!");
      return;
    }
    if (!this.receta || !this.receta.id) return;

    // VALIDACIONES ANTES DE ENVIAR
    if (this.puntuacionFija === 0) {
      alert("Por favor, dale una puntuación con las estrellas antes de publicar.");
      return;
    }
    if (this.nuevoComentario.trim() === '') {
      alert("Por favor, escribe un comentario para tu reseña.");
      return;
    }

    try {
      // 1. Guardamos la puntuación para que cuente en la media global
      await this.recetasService.valorarReceta(this.receta.id, this.usuarioActualId, this.puntuacionFija);

      // 2. Guardamos el comentario adjuntando las estrellas que eligió
      const comentarioObj = {
        usuarioId: this.usuarioActualId,
        usuarioNombre: this.usuarioActualNombre,
        texto: this.nuevoComentario,
        fecha: Date.now(),
        puntuacion: this.puntuacionFija // <--- Metemos las estrellas en el comentario
      };

      await this.recetasService.addComentario(this.receta.id, comentarioObj);

      // 3. Limpiamos el formulario tras publicarlo con éxito
      this.nuevoComentario = '';
      this.puntuacionFija = 0;
      this.estrellasSeleccionadas = 0;

    } catch (error) {
      alert("Hubo un error al publicar tu reseña.");
    }
  }

  // --- NAVEGAR AL FORMULARIO DE EDICIÓN ---
  activarEdicion() {
    if (this.receta && this.receta.id) {
      // Te lleva al componente que tú ya tenías creado: app-formulario_receta
      // Le pasamos el ID por la URL para que el formulario sepa que tiene que cargar datos
      this.router.navigate(['/subir-receta'], { queryParams: { editar: this.receta.id } });
    }
  }
}
