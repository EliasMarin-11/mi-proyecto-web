import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Receta, RecetasService } from '../../services/recetas.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-tarjeta_receta_horizontal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta_receta_horizontal.component.html',
  styleUrl: './tarjeta_receta_horizontal.component.css'
})
export class Tarjeta_receta_horizontalComponent implements OnInit {
  @Input() receta!: Receta;

  esFavorito = false;
  userId: string | null = null;

  // 1. AQUÍ DECLARAMOS LA VARIABLE QUE TE DABA ERROR
  guardando = false;

  private recetasService = inject(RecetasService);
  private authService = inject(AuthService);

  // 2. AQUÍ INYECTAMOS LA HERRAMIENTA DE ACTUALIZACIÓN QUE FALTABA
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.comprobarSiEsFavorito();
      }
    });
  }

  async comprobarSiEsFavorito() {
    if (this.userId && this.receta.id) {
      try {
        const favs = await this.recetasService.getFavoritosIds(this.userId);
        this.esFavorito = favs.includes(this.receta.id);
        this.cdr.detectChanges();
      } catch (error) {
        console.error("Error al comprobar favoritos:", error);
      }
    }
  }

  async clickFavorito(evento: Event) {
    evento.preventDefault();
    evento.stopPropagation();

    if (this.guardando) return;

    if (!this.userId) {
      alert('¡Debes iniciar sesión para guardar tus recetas favoritas!');
      return;
    }

    if (this.receta.id) {
      this.guardando = true;

      // ACTUALIZACIÓN OPTIMISTA: Cambiamos el color AL INSTANTE
      const estadoAnterior = this.esFavorito;
      this.esFavorito = !this.esFavorito;
      this.cdr.detectChanges();

      try {
        // Guardamos en Firebase por detrás
        await this.recetasService.toggleFavorito(this.userId, this.receta.id, estadoAnterior);

      } catch (error) {
        // Si hay error, deshacemos el cambio visual
        console.error("Error al guardar en Firebase, revirtiendo color...", error);
        this.esFavorito = estadoAnterior;
        this.cdr.detectChanges();
        alert("Hubo un error de conexión y no se pudo guardar el favorito.");
      } finally {
        this.guardando = false;
      }
    }
  }
}
