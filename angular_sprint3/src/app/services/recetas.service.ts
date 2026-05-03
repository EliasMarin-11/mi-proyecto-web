import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, doc, setDoc, deleteDoc, getDoc, updateDoc, arrayUnion, arrayRemove, query, where } from '@angular/fire/firestore';

// 1. Interfaces
export interface Valoracion {
  userId: string;
  puntuacion: number;
}

export interface Comentario {
  usuarioId: string;
  usuarioNombre: string;
  texto: string;
  fecha: number;
  puntuacion?: number;
}

export interface Receta {
  id?: string;
  titulo: string;
  imagen: string;
  tiempo: string;
  dificultad: string;
  tipo_plato: string;
  dieta: string[];
  ingredientes: string[];
  descripcion: string;
  instrucciones?: string[];
  raciones?: number;
  alergenos?: string[];
  estrellas?: number;
  valoraciones?: Valoracion[];
  comentarios?: Comentario[];
  autorNombre?: string;
  userId?: string;
  fechaCreacion?: string;
  duracion_categoria?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecetasService {
  private firestore: Firestore = inject(Firestore);

  async getTodasLasRecetas(): Promise<Receta[]> {
    const recetasCol = collection(this.firestore, 'recetas');
    const snapshot = await getDocs(recetasCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receta));
  }

  async buscarRecetas(ingredientesBuscar: string[], filtrosSeleccionados: string[]): Promise<Receta[]> {
    let todas: Receta[] = await this.getTodasLasRecetas();

    // 1. FILTRO DE INGREDIENTES
    if (ingredientesBuscar && ingredientesBuscar.length > 0) {
      const ingredientesBuscadosMin = ingredientesBuscar.map(i => i.toLowerCase().trim());
      todas = todas.filter(receta => {
        if (!receta.ingredientes) return false;
        return receta.ingredientes.some(ingReceta => {
          const ingRecetaMin = ingReceta.toLowerCase();
          return ingredientesBuscadosMin.some(termino => ingRecetaMin.includes(termino));
        });
      });
    }

    // 2. FILTROS AVANZADOS (Dificultad, Dieta, Tiempo y Estrellas)
    if (filtrosSeleccionados && filtrosSeleccionados.length > 0) {
      let minEstrellasRequeridas = 0;
      filtrosSeleccionados.forEach(filtro => {
        if (filtro.startsWith('estrellas-')) {
          const numeroEstrellas = parseInt(filtro.split('-')[1]);
          if (numeroEstrellas > minEstrellasRequeridas) {
            minEstrellasRequeridas = numeroEstrellas;
          }
        }
      });

      const filtrosNormales = filtrosSeleccionados.filter(f => !f.startsWith('estrellas-'));

      todas = todas.filter(receta => {

        // Comprobación de Estrellas
        let pasaFiltroEstrellas = true;
        if (minEstrellasRequeridas > 0) {
          let media = 0;
          if (receta.valoraciones && receta.valoraciones.length > 0) {
            const suma = receta.valoraciones.reduce((sum, v) => sum + v.puntuacion, 0);
            media = suma / receta.valoraciones.length;
          }
          pasaFiltroEstrellas = media >= minEstrellasRequeridas;
        }

        // Comprobación del resto de filtros
        let pasaFiltroNormal = true;
        if (filtrosNormales.length > 0) {
          // Usamos (variable || '') para asegurar que siempre sea texto y nunca 'undefined'
          const coincideDificultad = filtrosNormales.includes((receta.dificultad || '').toLowerCase());
          const coincideTipo = filtrosNormales.includes((receta.tipo_plato || '').toLowerCase());
          const coincideDieta = receta.dieta ? receta.dieta.some((d: string) => filtrosNormales.includes((d || '').toLowerCase())) : false;
          const coincideDuracion = filtrosNormales.includes((receta.duracion_categoria || '').toLowerCase());

          pasaFiltroNormal = coincideDificultad || coincideTipo || coincideDieta || coincideDuracion;
        }

        return pasaFiltroEstrellas && pasaFiltroNormal;
      });
    }

    return todas;
  }

  async toggleFavorito(userId: string, recetaId: string, yaEsFavorito: boolean) {
    const favRef = doc(this.firestore, `usuarios/${userId}/favoritos/${recetaId}`);
    if (yaEsFavorito) await deleteDoc(favRef);
    else await setDoc(favRef, { guardado: true });
  }

  async getFavoritosIds(userId: string): Promise<string[]> {
    const favsCol = collection(this.firestore, `usuarios/${userId}/favoritos`);
    const snapshot = await getDocs(favsCol);
    return snapshot.docs.map(doc => doc.id);
  }

  async getRecetasFavoritas(userId: string): Promise<Receta[]> {
    const idsFavoritos = await this.getFavoritosIds(userId);
    if (idsFavoritos.length === 0) return [];
    const todas = await this.getTodasLasRecetas();
    return todas.filter(receta => idsFavoritos.includes(receta.id!));
  }

  async getRecetaPorId(id: string): Promise<Receta | undefined> {
    const docRef = doc(this.firestore, `recetas/${id}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as Receta;
    console.error("¡No se encontró la receta!");
    return undefined;
  }

  async valorarReceta(recetaId: string, userId: string, puntuacion: number) {
    const recetaRef = doc(this.firestore, `recetas/${recetaId}`);
    const docSnap = await getDoc(recetaRef);

    if (!docSnap.exists()) return;

    const receta = docSnap.data() as Receta;
    const valoracionesActuales = receta.valoraciones || [];

    const valoracionPrevia = valoracionesActuales.find(v => v.userId === userId);

    if (valoracionPrevia) {
      await updateDoc(recetaRef, { valoraciones: arrayRemove(valoracionPrevia) });
    }

    const nuevaValoracion: Valoracion = { userId, puntuacion };
    await updateDoc(recetaRef, { valoraciones: arrayUnion(nuevaValoracion) });
  }

  async addComentario(recetaId: string, comentario: Comentario) {
    const recetaRef = doc(this.firestore, `recetas/${recetaId}`);
    await updateDoc(recetaRef, { comentarios: arrayUnion(comentario) });
  }

  async getRecetasPorUsuario(userId: string): Promise<Receta[]> {
    const recetasCol = collection(this.firestore, 'recetas');
    const q = query(recetasCol, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receta));
  }

  async actualizarReceta(id: string, datosNuevos: Partial<Receta>): Promise<void> {
    const docRef = doc(this.firestore, `recetas/${id}`);
    try {
      await updateDoc(docRef, datosNuevos);
      console.log("Receta actualizada con éxito");
    } catch (error) {
      console.error("Error al actualizar la receta: ", error);
      throw error;
    }
  }
}
