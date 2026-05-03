import { Component, ViewChild, ElementRef, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuscadorComponent } from './components/buscador/buscador.component';
import { Tarjeta_receta_verticalComponent } from './components/tarjeta_receta_vertical/tarjeta_receta_vertical.component';
import { RecetasService, Receta } from './services/recetas.service';

@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [CommonModule, BuscadorComponent, Tarjeta_receta_verticalComponent],
  templateUrl: './INICIO.html',
})
export class INICIO implements OnInit {
  @ViewChild('carrusel') carrusel!: ElementRef;

  private recetasService = inject(RecetasService);
  private cdr = inject(ChangeDetectorRef);

  // Array normal para guardar los datos
  recetas: Receta[] = [];

  scrollAmount = 250;

  // Llamamos a getTodasLasRecetas() (el método que SÍ existe en tu servicio)
  async ngOnInit() {
    this.recetas = await this.recetasService.getTodasLasRecetas();
    this.cdr.detectChanges();
  }

  moverDerecha() {
    const el = this.carrusel.nativeElement;
    const alFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
    if (alFinal) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: this.scrollAmount, behavior: 'smooth' });
    }
  }

  moverIzquierda() {
    const el = this.carrusel.nativeElement;
    if (el.scrollLeft <= 0) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -this.scrollAmount, behavior: 'smooth' });
    }
  }
}
