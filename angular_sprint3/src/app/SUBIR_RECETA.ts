import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-subir_receta-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './SUBIR_RECETA.html',
})
export class SUBIR_RECETA { }
