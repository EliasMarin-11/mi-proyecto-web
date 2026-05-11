import { Component, ViewChild, ElementRef, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. CORREGIMOS LAS RUTAS (añadiendo '../' para salir de la carpeta 'principales')
import { BuscadorComponent } from '../components/buscador/buscador.component';
import { Tarjeta_receta_verticalComponent } from '../components/tarjeta_receta_vertical/tarjeta_receta_vertical.component';
import { RecetasService, Receta } from '../services/recetas.service';
import { PromocionesComponent } from '../components/promociones/promociones.component';

// Importaciones de Ionic
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [
    CommonModule,
    BuscadorComponent,
    Tarjeta_receta_verticalComponent,
    PromocionesComponent,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSpinner
  ],
  templateUrl: './INICIO.html',
})
export class INICIO implements OnInit {
  // 2. LE AVISAMOS A TYPESCRIPT QUE EL CARRUSEL ES UN ELEMENTO HTML
  @ViewChild('carrusel') carrusel!: ElementRef<HTMLElement>;

  private recetasService = inject(RecetasService);
  private cdr = inject(ChangeDetectorRef);

  recetas: Receta[] = [];
  scrollAmount = 250;

  async ngOnInit() {
    this.recetas = await this.recetasService.getTodasLasRecetas();
    this.cdr.detectChanges();
  }

  moverDerecha() {
    // 3. ASEGURAMOS EL TIPO DE DATO AQUÍ TAMBIÉN
    const el = this.carrusel.nativeElement as HTMLElement;
    const alFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
    if (alFinal) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: this.scrollAmount, behavior: 'smooth' });
    }
  }

  moverIzquierda() {
    const el = this.carrusel.nativeElement as HTMLElement;
    if (el.scrollLeft <= 0) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -this.scrollAmount, behavior: 'smooth' });
    }
  }
}
