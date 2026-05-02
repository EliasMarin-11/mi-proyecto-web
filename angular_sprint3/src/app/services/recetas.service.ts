import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, doc, setDoc, deleteDoc, getDoc, updateDoc, arrayUnion, arrayRemove, query, where } from '@angular/fire/firestore';

// 1. Nueva interfaz para las puntuaciones
export interface Valoracion {
  userId: string;
  puntuacion: number; // 1, 2, 3, 4, 5
}

export interface Comentario {
  usuarioId: string;
  usuarioNombre: string;
  texto: string;
  fecha: number;
  puntuacion?: number; // <--- AÑADE ESTA LÍNEA
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
  estrellas?: number; // Este campo lo mantenemos para la media, si quieres.

  // ELIMINAMOS: likes?: string[];

  // AÑADIMOS: Sistema de Valoraciones (Elías + Fusión Sprint 3)
  valoraciones?: Valoracion[];
  comentarios?: Comentario[];
  autorNombre?: string;
  userId?: string;
  fechaCreacion?: string;
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

  // ... (buscarRecetas, toggleFavorito, getFavoritosIds, getRecetasFavoritas, getRecetaPorId permanecen IGUAL) ...
  // (Copio las funciones que no cambian solo para asegurar que el archivo esté completo si lo necesitas entero)

  async buscarRecetas(ingredientesBuscar: string[], filtrosSeleccionados: string[]): Promise<Receta[]> {
    let todas: Receta[] = await this.getTodasLasRecetas();
    if (ingredientesBuscar && ingredientesBuscar.length > 0) {
      const ingredientesMin = ingredientesBuscar.map(i => i.toLowerCase());
      todas = todas.filter((receta: Receta) => {
        if (!receta.ingredientes) return false;
        return receta.ingredientes.some((ing: string) => ingredientesMin.includes(ing.toLowerCase()));
      });
    }
    if (filtrosSeleccionados && filtrosSeleccionados.length > 0) {
      todas = todas.filter((receta: Receta) => {
        const coincideDificultad = filtrosSeleccionados.includes(receta.dificultad.toLowerCase());
        const coincideTipo = filtrosSeleccionados.includes(receta.tipo_plato.toLowerCase());
        const coincideDieta = receta.dieta ? receta.dieta.some((d: string) => filtrosSeleccionados.includes(d.toLowerCase())) : false;
        return coincideDificultad || coincideTipo || coincideDieta;
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

  // --- AQUÍ EMPIEZAN LOS CAMBIOS IMPORTANTES ---

  // ELIMINADA: async toggleLike(...)

  // NUEVA FUNCIÓN: Valorar Receta (Estrellas)
  async valorarReceta(recetaId: string, userId: string, puntuacion: number) {
    const recetaRef = doc(this.firestore, `recetas/${recetaId}`);
    const docSnap = await getDoc(recetaRef);

    if (!docSnap.exists()) return;

    const receta = docSnap.data() as Receta;
    const valoracionesActuales = receta.valoraciones || [];

    // Comprobamos si el usuario ya había votado
    const valoracionPrevia = valoracionesActuales.find(v => v.userId === userId);

    if (valoracionPrevia) {
      // Si ya votó, primero quitamos la votación antigua (praxis recomendada en Firestore para updates limpios)
      await updateDoc(recetaRef, { valoraciones: arrayRemove(valoracionPrevia) });
    }

    // Añadimos la nueva votación
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
