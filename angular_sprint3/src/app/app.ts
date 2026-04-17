import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// --- 1. IMPORTAMOS LAS PIEZAS ---
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  // --- 2. DAMOS PERMISO PARA USARLOS ---
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Ya puedes borrar esto si quieres limpiar la vista
  protected readonly title = signal('What\'s in your Fridge');
}
