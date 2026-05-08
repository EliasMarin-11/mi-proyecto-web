import { Component } from '@angular/core';
import { PerfilComponent } from './components/perfil/perfil.component';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [PerfilComponent],
  templateUrl: './PERFIL.html',
})
export class PERFIL { }
