import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RecetasService, Receta } from './services/recetas.service';
import { Tarjeta_receta_horizontalComponent } from './components/tarjeta_receta_horizontal/tarjeta_receta_horizontal.component';

@Component({
  selector: 'app-buscador-page',
  standalone: true,
  imports: [CommonModule, Tarjeta_receta_horizontalComponent],
  templateUrl: './BUSCADOR.html',
})
export class BUSCADOR implements OnInit {
  private recetasService = inject(RecetasService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  recetasEncontradas: Receta[] = [];
  cargando = true;
  ingredientesBuscados: string[] = [];
  filtrosAplicados: string[] = [];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // 1. Recoger ingredientes
      if (params['ingredientes']) {
        this.ingredientesBuscados = params['ingredientes'].split(',');
      } else {
        this.ingredientesBuscados = [];
      }

      if (params['filtros']) {
        this.filtrosAplicados = params['filtros'].split(',');
      } else {
        this.filtrosAplicados = [];
      }

      this.ejecutarBusqueda();
    });
  }

  async ejecutarBusqueda() {
    this.cargando = true;
    try {
      console.log("Buscando con ingredientes:", this.ingredientesBuscados);
      console.log("Aplicando filtros:", this.filtrosAplicados);

      // Enviamos AMBOS arrays al servicio
      this.recetasEncontradas = await this.recetasService.buscarRecetas(
        this.ingredientesBuscados,
        this.filtrosAplicados
      );

      console.log("¡Recetas encontradas!", this.recetasEncontradas);
    } catch (error) {
      console.error("Error buscando:", error);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }
}
