import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'homepage',
  // --- 2. DAMOS PERMISO PARA USARLOS ---
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './homepage.html',
})
export class Homepage {
  // Ya puedes borrar esto si quieres limpiar la vista
}
