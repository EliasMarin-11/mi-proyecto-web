import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tarjeta_receta_horizontalComponent } from '../components/tarjeta_receta_horizontal/tarjeta_receta_horizontal.component';
import { RecetasService, Receta } from '../services/recetas.service';
import { AuthService } from '../services/auth';
import { DatabaseService } from '../services/database.service'; // 1. INYECTAMOS SQLite

// Importaciones de Ionic
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-favoritos-page',
  standalone: true,
  imports: [
    CommonModule,
    Tarjeta_receta_horizontalComponent,
    IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner
  ],
  templateUrl: './FAVORITOS.html',
})
export class FAVORITOS implements OnInit {
  private recetasService = inject(RecetasService);
  private authService = inject(AuthService);
  private databaseService = inject(DatabaseService); // Instancia de SQLite
  private cdr = inject(ChangeDetectorRef);

  misFavoritas: Receta[] = [];
  cargando = true;

  ngOnInit() {
    // Solo permitimos el acceso a usuarios logeados
    this.authService.user$.subscribe(async user => {
      if (user) {
        this.cargando = true;
        this.cdr.detectChanges();

        try {
          // 2. OBTENEMOS LOS IDs DE LA BASE DE DATOS DEL MÓVIL (SQLite)
          const favoritosIds = await this.databaseService.getFavoritosIds();

          // 3. OBTENEMOS TODAS LAS RECETAS DE FIREBASE
          const todasLasRecetas = await this.recetasService.getTodasLasRecetas();

          // 4. CRUZAMOS LOS DATOS: Filtramos las recetas de Firebase usando los IDs de SQLite
          this.misFavoritas = todasLasRecetas.filter(receta =>
            receta.id && favoritosIds.includes(receta.id)
          );

        } catch (error) {
          console.error("Error al cargar favoritos desde SQLite:", error);
          this.misFavoritas = [];
        }

        this.cargando = false;
        this.cdr.detectChanges();
      } else {
        // Si no está logeado, no mostramos nada
        this.misFavoritas = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
