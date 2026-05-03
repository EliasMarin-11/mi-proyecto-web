import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecetasService, Receta, Comentario } from '../../services/recetas.service';
import { AuthService } from '../../services/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore'; // IMPORTANTE AÑADIR getDoc Y doc AQUÍ

@Component({
  selector: 'app-receta_completa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receta_completa.component.html',
  styleUrl: './receta_completa.component.css'
})
export class Receta_completaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recetasService = inject(RecetasService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private firestore = inject(Firestore); // INYECTAMOS FIRESTORE

  recetaId: string | null = null;
  receta: Receta | undefined;
  cargando = true;

  esPropietario = false;
  usuarioActualId: string | null = null;
  usuarioActualNombre: string = '';
  usuarioActualFoto: string | null = null; // NUEVA VARIABLE PARA LA FOTO
  usuarioYaComento = false;

  nuevoComentario = '';
  estrellasSeleccionadas = 0;
  totalVotos = 0;
  mediaEstrellas = '0.0';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.recetaId = params.get('id');
      if (this.recetaId) {
        this.cargarReceta(this.recetaId);
      }
    });

    this.authService.user$.subscribe(async user => {
      if (user) {
        this.usuarioActualId = user.uid;
        this.usuarioActualNombre = user.displayName || user.email?.split('@')[0] || 'Anónimo';

        // NUEVO: LEER LA FOTO DEL USUARIO DESDE FIRESTORE
        try {
          const userDocRef = doc(this.firestore, 'usuarios', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data()['avatar']) {
            this.usuarioActualFoto = userDocSnap.data()['avatar'];
          }
        } catch (e) {
          console.error("Error al cargar foto del usuario:", e);
        }

        this.verificarSiYaComento();
      } else {
        this.usuarioActualId = null;
        this.usuarioActualFoto = null;
      }
      this.cdr.detectChanges();
    });
  }

  async cargarReceta(id: string) {
    try {
      this.receta = await this.recetasService.getRecetaPorId(id);
      if (this.receta) {
        this.calcularEstrellas();
        this.verificarSiYaComento();

        if (this.usuarioActualId && this.receta.userId === this.usuarioActualId) {
          this.esPropietario = true;
        }
      } else {
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Error cargando receta:', error);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  calcularEstrellas() {
    if (this.receta && this.receta.valoraciones && this.receta.valoraciones.length > 0) {
      this.totalVotos = this.receta.valoraciones.length;
      const suma = this.receta.valoraciones.reduce((acc, val) => acc + val.puntuacion, 0);
      this.mediaEstrellas = (suma / this.totalVotos).toFixed(1);
    } else {
      this.totalVotos = 0;
      this.mediaEstrellas = '0.0';
    }
  }

  verificarSiYaComento() {
    if (this.receta && this.receta.comentarios && this.usuarioActualId) {
      this.usuarioYaComento = this.receta.comentarios.some(c => c.usuarioId === this.usuarioActualId);
    }
  }

  hoverEstrella(num: number) { this.estrellasSeleccionadas = num; }
  resetEstrellas() { if (this.estrellasSeleccionadas === 0) this.estrellasSeleccionadas = 0; }
  seleccionarPuntuacion(num: number) { this.estrellasSeleccionadas = num; }

  async publicarResena() {
    if (!this.usuarioActualId) {
      alert("Debes iniciar sesión para comentar.");
      return;
    }
    if (this.esPropietario) {
      alert("No puedes valorar tu propia receta.");
      return;
    }
    if (this.usuarioYaComento) {
      alert("Ya has comentado en esta receta.");
      return;
    }
    if (this.estrellasSeleccionadas === 0) {
      alert("Por favor, selecciona una puntuación.");
      return;
    }
    if (!this.nuevoComentario.trim()) {
      alert("Por favor, escribe un comentario.");
      return;
    }
    if (!this.recetaId) return;

    try {
      await this.recetasService.valorarReceta(this.recetaId, this.usuarioActualId, this.estrellasSeleccionadas);

      const comentarioObj: Comentario = {
        usuarioId: this.usuarioActualId,
        usuarioNombre: this.usuarioActualNombre,
        // GUARDAMOS LA FOTO REAL DEL USUARIO O LA DE POR DEFECTO
        avatar: this.usuarioActualFoto || '/img/usuario-sinfondo.png',
        texto: this.nuevoComentario,
        fecha: Date.now(),
        puntuacion: this.estrellasSeleccionadas
      };

      await this.recetasService.addComentario(this.recetaId, comentarioObj);

      alert("¡Reseña publicada con éxito!");

      this.usuarioYaComento = true;
      this.nuevoComentario = '';
      this.estrellasSeleccionadas = 0;
      await this.cargarReceta(this.recetaId);

    } catch (error) {
      console.error("Error al publicar la reseña:", error);
      alert("Hubo un error al publicar la reseña.");
    }
  }

  activarEdicion() {
    if (this.recetaId) {
      this.router.navigate(['/subir-receta'], { queryParams: { editar: this.recetaId } });
    }
  }
}
