import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulario_receta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario_receta.component.html',
  styleUrl: './formulario_receta.component.css'
})
export class Formulario_recetaComponent {
  private storage = inject(Storage);
  private firestore = inject(Firestore);
  private router = inject(Router);

  titulo: string = '';
  tiempoNum: number | null = null;
  tiempoUnidad: string = 'min';
  raciones: number | null = null;
  dificultad: string = '';
  descripcion: string = '';

  ingredientes = [{ nombre: '', cantidad: null as number | null, unidad: '' }];
  pasos = [{ texto: '' }];

  imagenPreview: string | null = null;
  archivoImagen: File | null = null;

  guardando: boolean = false;

  addIngrediente() {
    this.ingredientes.push({ nombre: '', cantidad: null, unidad: '' });
  }

  removeIngrediente(index: number) {
    if (this.ingredientes.length > 1) {
      this.ingredientes.splice(index, 1);
    }
  }

  addPaso() {
    this.pasos.push({ texto: '' });
  }

  removePaso(index: number) {
    if (this.pasos.length > 1) {
      this.pasos.splice(index, 1);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoImagen = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  borrarFoto() {
    this.imagenPreview = null;
    this.archivoImagen = null;
  }

  async publicarReceta() {
    if (!this.archivoImagen) {
      alert("¡Debes subir una foto apetitosa de tu receta!");
      return;
    }

    this.guardando = true;

    try {
      const rutaImagen = `imagenes_recetas/${Date.now()}_${this.archivoImagen.name}`;
      const referenciaStorage = ref(this.storage, rutaImagen);
      await uploadBytes(referenciaStorage, this.archivoImagen);

      const urlDescarga = await getDownloadURL(referenciaStorage);

      const nuevaReceta = {
        titulo: this.titulo,
        tiempo: `${this.tiempoNum} ${this.tiempoUnidad}`,
        raciones: this.raciones,
        dificultad: this.dificultad,
        descripcion: this.descripcion,
        ingredientes: this.ingredientes.map(i => `${i.cantidad} ${i.unidad} de ${i.nombre}`),
        instrucciones: this.pasos.map(p => p.texto),
        imagen: urlDescarga,
        tipo_plato: 'General',
        dieta: [],
        alergenos: [],
        likes: [],
        comentarios: []
      };

      const coleccionRecetas = collection(this.firestore, 'recetas');
      await addDoc(coleccionRecetas, nuevaReceta);

      alert("¡Receta publicada con éxito en Firebase!");

      this.router.navigate(['/']);

    } catch (error) {
      console.error(error);
      alert("Hubo un error al guardar la receta.");
    } finally {
      this.guardando = false;
    }
  }
}
