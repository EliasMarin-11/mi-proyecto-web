import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RecetasService, Receta } from '../../services/recetas.service';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms'; // MUY IMPORTANTE para usar ngModel

@Component({
  selector: 'app-receta_completa',
  standalone: true,
  imports: [CommonModule, FormsModule], // Añadimos FormsModule aquí
  templateUrl: './receta_completa.component.html',
  styleUrl: './receta_completa.component.css'
})
export class Receta_completaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private recetasService = inject(RecetasService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  receta: Receta | undefined;
  cargando = true;

  // Nuevas variables
  userIdActual: string | null = null;
  modoEdicion = false;
  guardando = false;

  ngOnInit() {
    // 1. Obtener quién es el usuario logueado
    this.authService.user$.subscribe(user => {
      this.userIdActual = user?.uid || null;
    });

    // 2. Comprobar si venimos con el botón de "Editar" pulsado
    this.route.queryParamMap.subscribe(qParams => {
      if (qParams.get('modoEdicion') === 'true') {
        this.modoEdicion = true;
      }
    });

    // 3. Cargar la receta
    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      this.cargando = true;

      try {
        if (id) {
          this.receta = await this.recetasService.getRecetaPorId(id);
        }
      } catch (error) {
        console.error("Error al cargar la receta:", error);
      } finally {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 4. Función para guardar los cambios en Firebase
  async guardarCambios() {
    if (!this.receta || !this.receta.id) return;

    this.guardando = true;
    try {
      // Enviamos solo los campos que permitiremos editar de forma sencilla
      await this.recetasService.actualizarReceta(this.receta.id, {
        titulo: this.receta.titulo,
        descripcion: this.receta.descripcion,
        dificultad: this.receta.dificultad,
        tiempo: this.receta.tiempo
      });
      alert('¡Tus cambios han sido guardados!');
      this.modoEdicion = false; // Salimos del modo edición
    } catch (error) {
      alert('Ocurrió un error guardando los cambios.');
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  activarEdicion() {
    this.modoEdicion = true;
  }
}
