import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Importamos Storage (de Elías) y Auth (nuestro)
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
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
  // Inyectamos todo lo necesario
  private storage = inject(Storage);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);

  titulo = '';
  tiempoNum: number | null = null;
  tiempoUnidad = 'min';
  raciones: number | null = null;
  dificultad = '';
  descripcion = '';

  ingredientes = [{ nombre: '', cantidad: null as number | null, unidad: '' }];
  pasos = ['']; // Mantenemos el formato simple para que no rompa el HTML

  imagenPreview: string | null = null;
  archivoImagen: File | null = null; // Variable de Elías para el Storage

  guardando: boolean = false; // Variable de Elías para el botón de carga

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
      this.archivoImagen = file; // Guardamos el archivo real para subirlo
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string; // Para mostrarlo en pantalla
      };
      reader.readAsDataURL(file);
    }
  }

  borrarFoto() {
    this.imagenPreview = null;
    this.archivoImagen = null;
  }

  // Fusión maestra: Guardar receta con Storage y Auth
  async guardarReceta() {
    this.authService.user$.subscribe(async (user) => {
      if (!user) {
        alert("Debes iniciar sesión para subir una receta.");
        this.router.navigate(['/login']);
        return;
      }

      if (!this.titulo || !this.tiempoNum || !this.raciones || !this.dificultad || !this.descripcion || !this.archivoImagen) {
        alert("Por favor, rellena todos los campos principales y sube una foto.");
        return;
      }

      this.guardando = true;

      try {
        // 1. Subir foto a Firebase Storage (Lógica de Elías)
        const rutaImagen = `imagenes_recetas/${Date.now()}_${this.archivoImagen.name}`;
        const referenciaStorage = ref(this.storage, rutaImagen);
        await uploadBytes(referenciaStorage, this.archivoImagen);
        
        // 2. Obtener el enlace de la imagen ya subida
        const urlDescarga = await getDownloadURL(referenciaStorage);

        // 3. Formatear ingredientes
        const ingredientesFormateados = this.ingredientes.map(ing =>
          `${ing.cantidad || ''} ${ing.unidad} ${ing.nombre}`.trim()
        );

        // 4. Crear el objeto receta mezclando ambos trabajos
        const nuevaReceta = {
          titulo: this.titulo,
          tiempo: `${this.tiempoNum} ${this.tiempoUnidad}`,
          raciones: this.raciones,
          dificultad: this.dificultad,
          descripcion: this.descripcion,
          ingredientes: ingredientesFormateados,
          instrucciones: this.pasos,
          imagen: urlDescarga, // Usamos la URL limpia del Storage
          estrellas: 0,
          alergenos: [],
          dieta: [],
          tipo_plato: "Principal",
          userId: user.uid,
          autorNombre: user.displayName || user.email?.split('@')[0] || 'Usuario Anónimo',
          fechaCreacion: new Date().toISOString()
        };

        // 5. Guardar todo en la base de datos Firestore
        const recetasRef = collection(this.firestore, 'recetas');
        await addDoc(recetasRef, nuevaReceta);

        alert("¡Receta publicada con éxito!");
        this.router.navigate(['/perfil']);

      } catch (error) {
        console.error(error);
        alert("Hubo un error al guardar la receta. Revisa la consola.");
      } finally {
        this.guardando = false;
      }
    });
  }

  trackByFn(index: any, item: any) {
    return index;
  }
}