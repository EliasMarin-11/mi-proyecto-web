import { Component, Input } from '@angular/core';
import { Receta } from '../../services/recetas.service';

@Component({
  selector: 'app-tarjeta_receta_horizontal',
  standalone: true,
  imports: [],
  templateUrl: './tarjeta_receta_horizontal.component.html',
  styleUrl: './tarjeta_receta_horizontal.component.css'
})
export class Tarjeta_receta_horizontalComponent {
  @Input() receta!: Receta;
}
