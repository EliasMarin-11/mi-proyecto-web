import { Component, Input, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
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
  private router = inject(Router);

  irAEditar(evento: Event) {
    evento.preventDefault(); // Evita que el click accione la etiqueta <a>
    evento.stopPropagation();

    // Viajamos a la receta pasándole un parámetro para que se abra en modo edición
    this.router.navigate(['/ver-receta', this.recetaData.id], { queryParams: { modoEdicion: 'true' } });
  }
}
