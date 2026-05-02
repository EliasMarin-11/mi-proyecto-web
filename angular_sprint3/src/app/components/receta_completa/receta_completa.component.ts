import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RecetasService, Receta } from '../../services/recetas.service';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';

import { Auth, authState } from '@angular/fire/auth';

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
  private cdr = inject(ChangeDetectorRef);
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  receta: Receta | undefined;
  cargando = true;
  nuevoComentario: string = '';
  unsubscribe: any;

  usuarioActualId: string | null = null;
  usuarioActualNombre: string = '';

  ngOnInit() {
    authState(this.auth).subscribe((user) => {
      if (user) {
        this.usuarioActualId = user.uid;
        this.usuarioActualNombre = user.displayName || user.email || 'Chef Anónimo';
        console.log("Usuario logueado detectado:", this.usuarioActualNombre);
      } else {
        this.usuarioActualId = null;
        this.usuarioActualNombre = '';
      }
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

  async darLike() {
    if (!this.usuarioActualId) {
      alert("¡Debes iniciar sesión para dar me gusta!");
      return;
    }
    if (!this.receta || !this.receta.id) return;

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
}
