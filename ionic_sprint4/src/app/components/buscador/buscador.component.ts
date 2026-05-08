import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.css'
})
export class BuscadorComponent implements OnInit {
  menuAbierto = false;
  listaIngredientes: string[] = [];
  opcionesSugeridas: string[] = [];

  // NUEVO: Array para guardar los filtros que marcamos
  filtrosSeleccionados: string[] = [];

  private router = inject(Router);

  ngOnInit() {
    fetch('/data/ingredientes.json')
      .then(respuesta => respuesta.json())
      .then(datos => {
        this.opcionesSugeridas = datos.ingredientes;
      })
      .catch(error => console.error("Error al cargar el JSON", error));
  }

  toggleFiltros() {
    this.menuAbierto = !this.menuAbierto;
  }

  // NUEVA FUNCIÓN: Añade o quita un filtro de la lista si lo marcas o desmarcas
  toggleFiltro(filtro: string) {
    const index = this.filtrosSeleccionados.indexOf(filtro);
    if (index > -1) {
      this.filtrosSeleccionados.splice(index, 1); // Si ya estaba, lo quita
    } else {
      this.filtrosSeleccionados.push(filtro); // Si no estaba, lo añade
    }
  }

  anadirIngrediente(evento: any) {
    const input = evento.target;
    const valor = input.value.trim().toLowerCase();

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
    const inputElement = document.getElementById('input-ingrediente') as HTMLInputElement;

    if (inputElement) {
      const valorPendiente = inputElement.value.trim().toLowerCase();
      if (valorPendiente && !this.listaIngredientes.includes(valorPendiente)) {
        this.listaIngredientes.push(valorPendiente);
      }
      inputElement.value = '';
    }

    // PREPARAMOS LOS PARÁMETROS DINÁMICAMENTE
    const queryParams: any = {};

    // Solo enviamos si hay ingredientes
    if (this.listaIngredientes.length > 0) {
      queryParams.ingredientes = this.listaIngredientes.join(',');
    }

    // Solo enviamos si hay filtros seleccionados
    if (this.filtrosSeleccionados.length > 0) {
      queryParams.filtros = this.filtrosSeleccionados.join(',');
    }

    // NAVEGAMOS CON LOS PARÁMETROS LIMPIOS
    this.router.navigate(['/buscar'], { queryParams });
  }
}
