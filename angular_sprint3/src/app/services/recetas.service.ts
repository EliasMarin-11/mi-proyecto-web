import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, doc, setDoc, deleteDoc, getDoc, query, where } from '@angular/fire/firestore';

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
    console.log("1. Buscando ingredientes:", ingredientesBuscar);

    let todas: Receta[] = await this.getTodasLasRecetas();

    console.log("2. Todas las recetas de Firebase:", todas);

    if (ingredientesBuscar && ingredientesBuscar.length > 0) {
      const ingredientesMin = ingredientesBuscar.map(i => i.toLowerCase());
      console.log("3. Ingredientes en minúscula para buscar:", ingredientesMin);

      todas = todas.filter((receta: Receta) => {
        if (!receta.ingredientes) {
          console.log(`La receta ${receta.titulo} NO tiene el array de ingredientes.`);
          return false;
        }

        console.log(`4. Evaluando receta: ${receta.titulo} con ingredientes:`, receta.ingredientes);

        const coincide = receta.ingredientes.some((ing: string) => {
          const ingMin = ing.toLowerCase();
          const incluye = ingredientesMin.includes(ingMin);
          if (incluye) {
            console.log(`   -> ¡MATCH! Encontrado ingrediente: ${ingMin}`);
          }
          return incluye;
        });

        return coincide;
      });
      console.log("5. Recetas después de filtrar por ingredientes:", todas);
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

  // 1. Guarda o elimina la receta de los favoritos del usuario
  async toggleFavorito(userId: string, recetaId: string, yaEsFavorito: boolean) {
    const favRef = doc(this.firestore, `usuarios/${userId}/favoritos/${recetaId}`);
    if (yaEsFavorito) {
      await deleteDoc(favRef); // Si ya lo era, lo quitamos de la BD
    } else {
      await setDoc(favRef, { guardado: true }); // Si no, lo creamos
    }
  }

  // 2. Devuelve los IDs de los favoritos (para pintar el corazón rojo en las tarjetas)
  async getFavoritosIds(userId: string): Promise<string[]> {
    const favsCol = collection(this.firestore, `usuarios/${userId}/favoritos`);
    const snapshot = await getDocs(favsCol);
    return snapshot.docs.map(doc => doc.id);
  }

  // 3. Recupera la información completa de las recetas favoritas para la sección FAVORITOS
  async getRecetasFavoritas(userId: string): Promise<Receta[]> {
    console.log("Buscando IDs en Firebase para el usuario:", userId);
    const idsFavoritos = await this.getFavoritosIds(userId);
    console.log("IDs encontrados:", idsFavoritos);

    if (idsFavoritos.length === 0) return [];

    const todas = await this.getTodasLasRecetas();
    return todas.filter(receta => idsFavoritos.includes(receta.id!));
  }

  async getRecetaPorId(id: string): Promise<Receta | undefined> {
    const docRef = doc(this.firestore, `recetas/${id}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Receta;
    } else {
      console.error("¡No se encontró la receta!");
      return undefined;
    }
  }

  // 4. Recupera las recetas creadas por un usuario específico
  async getRecetasPorUsuario(userId: string): Promise<Receta[]> {
    const recetasCol = collection(this.firestore, 'recetas');
    // Creamos una consulta: "Tráeme las recetas donde el userId sea igual al que te paso"
    const q = query(recetasCol, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receta));
  }

}
