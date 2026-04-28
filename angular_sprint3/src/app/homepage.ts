import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { BuscadorComponent} from './components/buscador/buscador.component';
import { Tarjeta_receta_verticalComponent} from './components/tarjeta_receta_vertical/tarjeta_receta_vertical.component';

@Component({
  selector: 'homepage',
  // --- 2. DAMOS PERMISO PARA USARLOS ---
  imports: [HeaderComponent, FooterComponent, BuscadorComponent, Tarjeta_receta_verticalComponent],
  templateUrl: './homepage.html',
})
export class Homepage {
  // Ya puedes borrar esto si quieres limpiar la vista
}
