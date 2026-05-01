import { Component } from '@angular/core';
import { BuscadorComponent } from './components/buscador/buscador.component';
import {Tarjeta_receta_horizontalComponent} from './components/tarjeta_receta_horizontal/tarjeta_receta_horizontal.component';

@Component({
  selector: 'app-favoritos-page',
  standalone: true,
  imports: [BuscadorComponent, Tarjeta_receta_horizontalComponent],
  templateUrl: './FAVORITOS.html',
})
export class FAVORITOS { }
