import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Receta_completaComponent } from './components/receta_completa/receta_completa.component';

@Component({
  selector: 'app-ver-receta-page',
  standalone: true,
  // 2. Añádelo al array de imports
  imports: [CommonModule, Receta_completaComponent],
  templateUrl: './VER_RECETA.html',
})
export class VER_RECETA {}
