import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// 1. IMPORTA EL COMPONENTE FÍSICAMENTE
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  // 2. REGÍSTRALO AQUÍ PARA QUE EL HTML LO ENTIENDA
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('elias_crak');
  protected readonly descripcion = signal('Mi primera práctica con componentes');
}
