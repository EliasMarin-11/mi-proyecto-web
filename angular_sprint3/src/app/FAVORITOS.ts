import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Añadido
import { HeaderComponent } from './components/header/header.component'; // Añadir si lo necesitas
import { Tarjeta_receta_horizontalComponent } from './components/tarjeta_receta_horizontal/tarjeta_receta_horizontal.component';
import { RecetasService, Receta } from './services/recetas.service';
import { AuthService } from './services/auth'; // <-- Ajusta tu ruta

@Component({
  selector: 'app-favoritos-page',
  standalone: true,
  imports: [CommonModule, Tarjeta_receta_horizontalComponent, HeaderComponent],
  templateUrl: './FAVORITOS.html',
})
export class FAVORITOS implements OnInit {
  private recetasService = inject(RecetasService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  misFavoritas: Receta[] = [];
  cargando = true;

  ngOnInit() {
    this.authService.user$.subscribe(async user => {
      if (user) {
        console.log("1. Usuario autenticado:", user.uid);

        // Activamos la pantalla de carga mientras buscamos sus recetas
        this.cargando = true;
        this.cdr.detectChanges();

        this.misFavoritas = await this.recetasService.getRecetasFavoritas(user.uid);
        console.log("2. Recetas favoritas recuperadas:", this.misFavoritas);

        this.cargando = false;
        this.cdr.detectChanges();
      } else {
        console.log("Esperando a Firebase Auth...");
        this.misFavoritas = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
