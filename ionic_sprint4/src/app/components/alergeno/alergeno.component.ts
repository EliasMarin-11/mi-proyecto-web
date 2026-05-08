import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-alergeno',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './alergeno.component.html',
    styleUrl: './alergeno.component.css'
})
export class AlergenoComponent {
  // Datos dinámicos para el formulario[cite: 34]
  ingredientes = [{ nombre: '', cantidad: null, unidad: '' }];
  pasos = [''];
  imagenPreview: string | null = null;

  alergenosDisponibles = ['Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 'Soja', 'Lácteos', 'Frutos secos', 'Apio', 'Mostaza', 'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos'];
  alergenosSeleccionados: string[] = [];

  dietasSeleccionadas: string[] = [];
  tipoPlatoSeleccionado: string = '';

  toggleSeleccion(item: string, array: string[]) {
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(item);
    }
  }

  setTipoPlato(tipo: string) {
    this.tipoPlatoSeleccionado = tipo;
  }
  
  addIngrediente() { this.ingredientes.push({ nombre: '', cantidad: null, unidad: '' }); }
  removeIngrediente(i: number) { if (this.ingredientes.length > 1) this.ingredientes.splice(i, 1); }
  addPaso() { this.pasos.push(''); }
  removePaso(i: number) { if (this.pasos.length > 1) this.pasos.splice(i, 1); }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imagenPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }
  borrarFoto() { this.imagenPreview = null; }
}
