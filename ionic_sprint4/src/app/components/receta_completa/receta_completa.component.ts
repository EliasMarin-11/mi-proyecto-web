import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecetasService, Receta, Comentario } from '../../services/recetas.service';
import { AuthService } from '../../services/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { DatabaseService } from '../../services/database.service';

// --- IMPORTA TODOS ESTOS COMPONENTES DE IONIC ---
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonSpinner,
  IonImg, IonButton, IonList, IonItem, IonLabel,
  IonChip, IonCard, IonCardHeader, IonCardSubtitle,
  IonCardContent, IonAvatar, IonTextarea, IonText
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-receta_completa',
  standalone: true,

  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonSpinner,
    IonImg, IonButton, IonList, IonItem, IonLabel,
    IonChip, IonCard, IonCardHeader, IonCardSubtitle,
    IonCardContent, IonAvatar, IonTextarea, IonText
  ],
  templateUrl: './receta_completa.component.html',
  styleUrl: './receta_completa.component.css'
})
export class Receta_completaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recetasService = inject(RecetasService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private firestore = inject(Firestore);
  private databaseService = inject(DatabaseService); // 2. LO GUARDAMOS EN UNA VARIABLE

  recetaId: string | null = null;
  receta: Receta | undefined;
  cargando = true;

  esPropietario = false;
  usuarioActualId: string | null = null;
  usuarioActualNombre: string = '';
  usuarioActualFoto: string | null = null;
  usuarioYaComento = false;

  // 3. NUEVA VARIABLE PARA SABER SI ES FAVORITA LOCALMENTE
  esFavoritaLocal = false;

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

        // 4. COMPROBAMOS SI YA LA HABÍAMOS GUARDADO EN SQLITE
        this.esFavoritaLocal = await this.databaseService.isFavorito(id);

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

  // 5. NUEVO MÉTODO QUE SE EJECUTA AL HACER CLIC EN EL CORAZÓN
  async toggleFavoritoLocal() {
    if (!this.recetaId) return;

    if (this.esFavoritaLocal) {
      // Si ya era favorita, la borramos del móvil
      await this.databaseService.removeFavorito(this.recetaId);
      this.esFavoritaLocal = false;
      alert('Eliminada de favoritos locales');
    } else {
      // Si no era favorita, la guardamos
      await this.databaseService.addFavorito(this.recetaId);
      this.esFavoritaLocal = true;
      alert('Guardada en favoritos del dispositivo');
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

  async publicarResena() { /* Igual */ }
  activarEdicion() { /* Igual */ }
  async borrarReceta() { /* Igual */ }
}
