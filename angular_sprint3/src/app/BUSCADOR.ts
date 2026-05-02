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

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['ingredientes']) {
        this.ingredientesBuscados = params['ingredientes'].split(',');
      } else {
        this.ingredientesBuscados = [];
      }
      this.ejecutarBusqueda();
    });
  }

  async ejecutarBusqueda() {
    this.cargando = true;
    try {
      console.log("Buscando estos ingredientes:", this.ingredientesBuscados);

      this.recetasEncontradas = await this.recetasService.buscarRecetas(this.ingredientesBuscados, []);

      console.log("¡Recetas encontradas!", this.recetasEncontradas);
    } catch (error) {
      console.error("Error buscando:", error);
    } finally {
      // Angular cambia la variable
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }
}

