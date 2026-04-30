import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-formulario_receta',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './formulario_receta.component.html',
    styleUrl: './formulario_receta.component.css'
})
export class Formulario_recetaComponent {
  // Listas dinámicas con un elemento inicial por defecto
  ingredientes = [{ nombre: '', cantidad: null, unidad: '' }];
  pasos = [''];
  imagenPreview: string | null = null; // Para la vista previa de la foto

  // --- LÓGICA DE INGREDIENTES ---
  addIngrediente() {
    this.ingredientes.push({ nombre: '', cantidad: null, unidad: '' });
  }

  removeIngrediente(index: number) {
    if (this.ingredientes.length > 1) {
      this.ingredientes.splice(index, 1);
    }
  }

  // --- LÓGICA DE PASOS ---
  addPaso() {
    this.pasos.push('');
  }

  removePaso(index: number) {
    if (this.pasos.length > 1) {
      this.pasos.splice(index, 1);
    }
  }

  // --- LÓGICA DE FOTO ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string; // Guardamos la URL base64 para el <img>
      };
      reader.readAsDataURL(file);
    }
  }

  borrarFoto() {
    this.imagenPreview = null;
  }
}
