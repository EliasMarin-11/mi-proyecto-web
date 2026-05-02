import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // 1. Añadimos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RecetasService, Receta } from '../../services/recetas.service';

@Component({
  selector: 'app-receta_completa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receta_completa.component.html',
  styleUrl: './receta_completa.component.css'
})
export class Receta_completaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private recetasService = inject(RecetasService);

  private cdr = inject(ChangeDetectorRef);

  receta: Receta | undefined;
  cargando = true;

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');

      this.cargando = true; // Nos aseguramos de que empiece cargando

      try {
        if (id) {
          this.receta = await this.recetasService.getRecetaPorId(id);
          console.log("¡Receta cargada con éxito!", this.receta);
        }
      } catch (error) {
        console.error("Error al cargar la receta:", error);
      } finally {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
