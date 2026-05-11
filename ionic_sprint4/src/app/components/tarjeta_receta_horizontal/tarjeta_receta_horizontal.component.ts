import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Receta } from '../../services/recetas.service';
import { DatabaseService } from '../../services/database.service'; // Inyectamos SQLite

// Imports de Ionic
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tarjeta_receta_horizontal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent // Componentes añadidos
  ],
  templateUrl: './tarjeta_receta_horizontal.component.html',
  styleUrl: './tarjeta_receta_horizontal.component.css'
})
export class Tarjeta_receta_horizontalComponent implements OnInit {
  @Input() receta!: Receta;

  esFavorito = false;
  guardando = false;

  // Ya no inyectamos AuthService ni RecetasService para la lógica de guardado
  private databaseService = inject(DatabaseService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.comprobarSiEsFavorito();
  }

  // Comprobamos directamente en la base de datos local SQLite
  async comprobarSiEsFavorito() {
    if (this.receta.id) {
      try {
        this.esFavorito = await this.databaseService.isFavorito(this.receta.id);
        this.cdr.detectChanges();
      } catch (error) {
        console.error("Error al comprobar favoritos locales:", error);
      }
    }
  }

  // Alternamos el favorito en la memoria del dispositivo
  async clickFavorito(evento: Event) {
    // Evitamos que al pulsar el corazón se abra la receta (navegación)
    evento.preventDefault();
    evento.stopPropagation();

    if (this.guardando || !this.receta.id) return;

    this.guardando = true;

    try {
      if (this.esFavorito) {
        await this.databaseService.removeFavorito(this.receta.id);
        this.esFavorito = false;
      } else {
        await this.databaseService.addFavorito(this.receta.id);
        this.esFavorito = true;
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.error("Error al modificar SQLite:", error);
      alert("Hubo un error al guardar tu favorito en el dispositivo.");
    } finally {
      this.guardando = false;
    }
  }
}
