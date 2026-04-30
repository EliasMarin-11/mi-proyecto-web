
import { Component, ViewChild, ElementRef } from '@angular/core';
import { BuscadorComponent } from './components/buscador/buscador.component';
import { Tarjeta_receta_verticalComponent} from './components/tarjeta_receta_vertical/tarjeta_receta_vertical.component';

@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [BuscadorComponent, Tarjeta_receta_verticalComponent,],
  templateUrl: './INICIO.html',
})
export class INICIO {
  @ViewChild('carrusel') carrusel!: ElementRef;

  scrollAmount = 250;

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
