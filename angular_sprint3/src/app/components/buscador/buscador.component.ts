import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-buscador',
    standalone: true,
    imports: [CommonModule,],
    templateUrl: './buscador.component.html',
    styleUrl: './buscador.component.css'
})
export class BuscadorComponent {
  menuAbierto = false;

  listaIngredientes: string[] = [];

  toggleFiltros() {
    this.menuAbierto = !this.menuAbierto;
  }

  anadirIngrediente(evento: any) {
    const input = evento.target;
    const valor = input.value.trim();
    if (valor && !this.listaIngredientes.includes(valor)) {
      this.listaIngredientes.push(valor);
      input.value = ''; // Limpia el cuadro de texto
    }
  }

  eliminarIngrediente(index: number) {
    this.listaIngredientes.splice(index, 1);
  }

  buscar() {
    console.log("Ingredientes seleccionados:", this.listaIngredientes);
    this.menuAbierto = false;
  }
}
