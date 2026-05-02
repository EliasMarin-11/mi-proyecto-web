import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // <--- AÑADIDO ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-formulario_receta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario_receta.component.html',
  styleUrl: './formulario_receta.component.css'
})
export class Formulario_recetaComponent implements OnInit {
  private storage = inject(Storage);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef); // <--- INYECTAMOS LA HERRAMIENTA

  // --- VARIABLES PARA MODO EDICIÓN ---
  recetaIdEdicion: string | null = null;
  estaEditando: boolean = false;
  urlImagenAntigua: string | null = null;

  // --- VARIABLES DEL FORMULARIO ---
  titulo = '';
  tiempoNum: number | null = null;
  tiempoUnidad = 'min';
  raciones: number | null = null;
  dificultad = '';
  descripcion = '';

  ingredientes = [{ nombre: '', cantidad: null as number | null, unidad: '' }];
  pasos = [''];

  imagenPreview: string | null = null;
  archivoImagen: File | null = null;

  guardando: boolean = false;

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      if (params['editar']) {
        this.recetaIdEdicion = params['editar'];
        this.estaEditando = true;
        await this.cargarDatosParaEdicion(this.recetaIdEdicion!);
      }
    });
  }

  // --- FUNCIÓN PARA CARGAR LOS DATOS EN LOS INPUTS ---
  async cargarDatosParaEdicion(id: string) {
    try {
      const docRef = doc(this.firestore, `recetas/${id}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const recetaData = docSnap.data();

        this.titulo = recetaData['titulo'] || '';
        this.raciones = recetaData['raciones'] || null;
        this.dificultad = recetaData['dificultad'] || '';
        this.descripcion = recetaData['descripcion'] || '';

        this.imagenPreview = recetaData['imagen'];
        this.urlImagenAntigua = recetaData['imagen'];

        if (recetaData['tiempo']) {
          const partesTiempo = recetaData['tiempo'].split(' ');
          this.tiempoNum = parseInt(partesTiempo[0]);
          this.tiempoUnidad = partesTiempo[1] || 'min';
        }

        if (recetaData['instrucciones'] && recetaData['instrucciones'].length > 0) {
          this.pasos = recetaData['instrucciones'];
        }

        if (recetaData['ingredientes'] && recetaData['ingredientes'].length > 0) {
          this.ingredientes = recetaData['ingredientes'].map((ingString: string) => {
            const partes = ingString.split(' ');
            const cantidadStr = partes[0];
            const unidadStr = partes[1];
            // Dependiendo de cómo guardamos antes, reconstruimos el string
            const indexDe = partes.indexOf('de');
            const nombreStr = indexDe !== -1 ? partes.slice(indexDe + 1).join(' ') : partes.slice(2).join(' ');

            return {
              cantidad: !isNaN(parseFloat(cantidadStr)) ? parseFloat(cantidadStr) : null,
              unidad: unidadStr || '',
              nombre: nombreStr || ingString
            };
          });
        }

        // ¡LA MAGIA OCURRE AQUÍ! Le decimos a Angular que refresque la pantalla con los datos recién traídos.
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error("Error al cargar la receta para editar:", error);
    }
  }

  // --- MÉTODOS DEL FORMULARIO ---
  addIngrediente() { this.ingredientes.push({ nombre: '', cantidad: null, unidad: '' }); }
  removeIngrediente(index: number) { if (this.ingredientes.length > 1) this.ingredientes.splice(index, 1); }
  addPaso() { this.pasos.push(''); }
  removePaso(index: number) { if (this.pasos.length > 1) this.pasos.splice(index, 1); }
  trackByFn(index: any, item: any) { return index; }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoImagen = file;
      const reader = new FileReader();
      reader.onload = () => { this.imagenPreview = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

  borrarFoto() {
    this.imagenPreview = null;
    this.archivoImagen = null;
    if (this.estaEditando) this.urlImagenAntigua = null;
  }

  async guardarReceta() {
    this.authService.user$.subscribe(async (user) => {
      if (!user) {
        alert("Debes iniciar sesión.");
        this.router.navigate(['/login']);
        return;
      }

      if (!this.titulo || !this.tiempoNum || !this.raciones || !this.dificultad || !this.descripcion) {
        alert("Por favor, rellena todos los campos principales.");
        return;
      }

      if (!this.archivoImagen && !this.urlImagenAntigua) {
        alert("¡Debes tener una foto para la receta!");
        return;
      }

      this.guardando = true;

      try {
        let urlDescarga = this.urlImagenAntigua;

        if (this.archivoImagen) {
          const rutaImagen = `imagenes_recetas/${Date.now()}_${this.archivoImagen.name}`;
          const referenciaStorage = ref(this.storage, rutaImagen);
          await uploadBytes(referenciaStorage, this.archivoImagen);
          urlDescarga = await getDownloadURL(referenciaStorage);
        }

        const ingredientesFormateados = this.ingredientes.map(ing =>
          `${ing.cantidad || ''} ${ing.unidad} de ${ing.nombre}`.trim().replace('  ', ' ')
        );

        if (!this.estaEditando) {
          const nuevaReceta = {
            titulo: this.titulo,
            tiempo: `${this.tiempoNum} ${this.tiempoUnidad}`,
            raciones: this.raciones,
            dificultad: this.dificultad,
            descripcion: this.descripcion,
            ingredientes: ingredientesFormateados,
            instrucciones: this.pasos,
            imagen: urlDescarga,
            estrellas: 0,
            alergenos: [],
            dieta: [],
            tipo_plato: "Principal",
            userId: user.uid,
            autorNombre: user.displayName || user.email?.split('@')[0] || 'Usuario Anónimo',
            fechaCreacion: new Date().toISOString()
          };

          const recetasRef = collection(this.firestore, 'recetas');
          await addDoc(recetasRef, nuevaReceta);
          alert("¡Receta publicada con éxito!");
        }
        else if (this.estaEditando && this.recetaIdEdicion) {
          const docRef = doc(this.firestore, `recetas/${this.recetaIdEdicion}`);
          await updateDoc(docRef, {
            titulo: this.titulo,
            tiempo: `${this.tiempoNum} ${this.tiempoUnidad}`,
            raciones: this.raciones,
            dificultad: this.dificultad,
            descripcion: this.descripcion,
            ingredientes: ingredientesFormateados,
            instrucciones: this.pasos,
            imagen: urlDescarga
          });
          alert("¡Receta actualizada con éxito!");
        }

        this.router.navigate(['/perfil']);

      } catch (error) {
        console.error(error);
        alert("Hubo un error. Revisa la consola.");
      } finally {
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
