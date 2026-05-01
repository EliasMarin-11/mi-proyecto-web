// src/app/services/recetas.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, query, where, documentId } from '@angular/fire/firestore';

export interface Receta {
  id?: string;
  titulo: string;
  imagen: string;
  tiempo: string;
  dificultad: string;
  tipo_plato: string;
  dieta: string[];
  ingredientes_clave: string[];
  alergenos: string[];
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecetasService {
  private firestore: Firestore = inject(Firestore);

  // Obtener TODAS las recetas (para mostrar de inicio)
  async getTodasLasRecetas(): Promise<Receta[]> {
    const recetasCol = collection(this.firestore, 'recetas');
    const snapshot = await getDocs(recetasCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receta));
  }

  // Filtrar recetas en local (Más fácil para tu caso de uso ahora)
  async buscarRecetas(ingredientesBuscar: string[], filtrosSeleccionados: string[]): Promise<Receta[]> {
    // 1. Me traigo todas (Como tienes pocas, es súper rápido)
    let todas = await this.getTodasLasRecetas();

    // 2. Filtro por Ingredientes (Si el array no está vacío)
    if (ingredientesBuscar.length > 0) {
      // Pasamos la búsqueda a minúsculas por si el usuario escribe "Pollo" o "pollo"
      const ingredientesMin = ingredientesBuscar.map(i => i.toLowerCase());

      todas = todas.filter(receta => {
        // Comprobamos si la receta contiene AL MENOS UNO de los ingredientes buscados
        // Si quieres que tenga TODOS, habría que cambiar 'some' por 'every'
        return receta.ingredientes_clave.some(ing => ingredientesMin.includes(ing.toLowerCase()));
      });
    }

    // 3. Filtro por Dificultad, Dieta, Tipo de Plato (Los del menú desplegable)
    if (filtrosSeleccionados.length > 0) {
      todas = todas.filter(receta => {
        // Comprobamos si la receta encaja con alguno de los filtros marcados
        const coincideDificultad = filtrosSeleccionados.includes(receta.dificultad.toLowerCase());
        const coincideTipo = filtrosSeleccionados.includes(receta.tipo_plato.toLowerCase());
        const coincideDieta = receta.dieta.some(d => filtrosSeleccionados.includes(d.toLowerCase()));

        // Si cumple cualquiera de los filtros, la mantenemos
        return coincideDificultad || coincideTipo || coincideDieta;
      });
    }

    return todas;
  }
}
