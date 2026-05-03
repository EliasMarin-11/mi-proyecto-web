import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroComponent } from './components/registro/registro.component';

@Component({
  selector: 'app-registro-page',
  standalone: true,
  imports: [CommonModule, RegistroComponent],
  templateUrl: './REGISTRO.html',
})
export class REGISTRO {
}
