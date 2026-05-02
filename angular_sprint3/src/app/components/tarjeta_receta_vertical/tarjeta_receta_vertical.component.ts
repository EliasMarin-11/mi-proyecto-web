import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tarjeta_receta_vertical',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './tarjeta_receta_vertical.component.html',
  styleUrl: './tarjeta_receta_vertical.component.css'
})
export class Tarjeta_receta_verticalComponent {
  @Input() recetaData: any;
}
