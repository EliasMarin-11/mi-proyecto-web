// src/app/components/buscador/buscador.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// Necesitas FormsModule si usas ngModel, aunque aquí estamos usando eventos directos[cite: 26]

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.css'
})
export class BuscadorComponent {
  menuAbierto = false;
  listaIngredientes: string[] = [];
  private router = inject(Router);

  toggleFiltros() { this.menuAbierto = !this.menuAbierto; }

  anadirIngrediente(evento: any) {
    const input = evento.target;
    const valor = input.value.trim();
    if (valor && !this.listaIngredientes.includes(valor)) {
      this.listaIngredientes.push(valor);
      input.value = '';
    }
  }

  eliminarIngrediente(index: number) {
    this.listaIngredientes.splice(index, 1);
  }

  buscar() {
    this.menuAbierto = false;

    // 1. Buscamos el elemento input en el HTML
    const inputElement = document.getElementById('input-ingrediente') as HTMLInputElement;

    // 2. Si el usuario dejó algo escrito pero no le dio a Enter, lo capturamos
    if (inputElement) {
      const valorPendiente = inputElement.value.trim();
      if (valorPendiente && !this.listaIngredientes.includes(valorPendiente)) {
        this.listaIngredientes.push(valorPendiente);
      }
      // Limpiamos el input visualmente
      inputElement.value = '';
    }

    // 3. Ahora sí, navegamos con la lista de ingredientes actualizada
    this.router.navigate(['/buscar'], {
      queryParams: {
        ingredientes: this.listaIngredientes.join(',')
      }
    });
  }
}
