import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  private recetasService = inject(RecetasService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private firestore = inject(Firestore);

  receta: Receta | undefined;
  cargando = true;
  nuevoComentario: string = '';
  unsubscribe: any;

  // Variables combinadas de Auth
  usuarioActualId: string | null = null;
  usuarioActualNombre: string = '';

  // Variables de Edición (Sprint 3)
  modoEdicion = false;
  guardando = false;

  ngOnInit() {
    // 1. Obtener quién es el usuario logueado
    this.authService.user$.subscribe(user => {
      if (user) {
        this.usuarioActualId = user.uid;
        this.usuarioActualNombre = user.displayName || user.email?.split('@')[0] || 'Chef Anónimo';
      } else {
        this.usuarioActualId = null;
        this.usuarioActualNombre = '';
      }
    });

    // 2. Comprobar si venimos con el botón de "Editar" pulsado
    this.route.queryParamMap.subscribe(qParams => {
      if (qParams.get('modoEdicion') === 'true') {
        this.modoEdicion = true;
      }
    });

    // 3. Cargar la receta en tiempo real
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
      }
      this.cargando = false;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  // --- FUNCIONES SOCIALES ---
  async darLike() {
    if (!this.usuarioActualId) {
      alert("¡Debes iniciar sesión para dar me gusta!");
      return;
    }
    if (!this.receta || !this.receta.id) return;

    // Ahora TypeScript ya reconoce 'likes' sin problemas
    const arrayLikes = this.receta.likes || []; 
    const yaDioLike = arrayLikes.includes(this.usuarioActualId);

    await this.recetasService.toggleLike(this.receta.id, this.usuarioActualId, yaDioLike);
  }

  async enviarComentario() {
    if (!this.usuarioActualId) {
      alert("¡Debes iniciar sesión para comentar!");
      return;
    }
    if (!this.receta || !this.receta.id || this.nuevoComentario.trim() === '') return;

    const comentarioObj = {
      usuarioId: this.usuarioActualId,
      usuarioNombre: this.usuarioActualNombre,
      texto: this.nuevoComentario,
      fecha: Date.now()
    };

    await this.recetasService.addComentario(this.receta.id, comentarioObj);
    this.nuevoComentario = '';
  }

  // --- FUNCIONES DE EDICIÓN ---
  async guardarCambios() {
    if (!this.receta || !this.receta.id) return;

    this.guardando = true;
    try {
      await this.recetasService.actualizarReceta(this.receta.id, {
        titulo: this.receta.titulo,
        descripcion: this.receta.descripcion,
        dificultad: this.receta.dificultad,
        tiempo: this.receta.tiempo
      });
      alert('¡Tus cambios han sido guardados!');
      this.modoEdicion = false; 
    } catch (error) {
      alert('Ocurrió un error guardando los cambios.');
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  activarEdicion() {
    this.modoEdicion = true;
  }
}