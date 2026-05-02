import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulario_receta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario_receta.component.html',
  styleUrl: './formulario_receta.component.css'
})
export class Formulario_recetaComponent {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  titulo = '';
  tiempoNum: number | null = null;
  tiempoUnidad = 'min';
  raciones: number | null = null;
  dificultad = '';
  descripcion = '';

  ingredientes = [{ nombre: '', cantidad: null, unidad: '' }];
  pasos = [''];
  imagenPreview: string | null = null;

  addIngrediente() {
    this.ingredientes.push({ nombre: '', cantidad: null, unidad: '' });
  }

  removeIngrediente(index: number) {
    if (this.ingredientes.length > 1) {
      this.ingredientes.splice(index, 1);
    }
  }

  addPaso() {
    this.pasos.push('');
  }

  removePaso(index: number) {
    if (this.pasos.length > 1) {
      this.pasos.splice(index, 1);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  borrarFoto() {
    this.imagenPreview = null;
  }

  async guardarReceta() {
    this.authService.user$.subscribe(async (user) => {
      if (!user) {
        alert("Debes iniciar sesión para subir una receta.");
        this.router.navigate(['/login']);
        return;
      }

      if (!this.titulo || !this.tiempoNum || !this.raciones || !this.dificultad || !this.descripcion || !this.imagenPreview) {
        alert("Por favor, rellena todos los campos principales y sube una foto.");
        return;
      }

      const ingredientesFormateados = this.ingredientes.map(ing =>
        `${ing.cantidad || ''} ${ing.unidad} ${ing.nombre}`.trim()
      );

      const nuevaReceta = {
        titulo: this.titulo,
        tiempo: `${this.tiempoNum} ${this.tiempoUnidad}`,
        raciones: this.raciones,
        dificultad: this.dificultad,
        descripcion: this.descripcion,
        ingredientes: ingredientesFormateados,
        instrucciones: this.pasos,
        imagen: this.imagenPreview,
        estrellas: 0,
        alergenos: [],
        dieta: [],
        tipo_plato: "Principal",
        userId: user.uid,
        autorNombre: user.displayName || user.email?.split('@')[0] || 'Usuario Anónimo',
        fechaCreacion: new Date().toISOString()
      };

      try {
        const recetasRef = collection(this.firestore, 'recetas');
        await addDoc(recetasRef, nuevaReceta);
        alert("¡Receta publicada con éxito!");
        this.router.navigate(['/perfil']);
      } catch (error) {
        console.error(error);
        alert("Hubo un error al guardar la receta.");
      }
    });
  }

  trackByFn(index: any, item: any) {
    return index;
  }
}
