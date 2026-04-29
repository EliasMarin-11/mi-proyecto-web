import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-buscador-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './BUSCADOR.html',
})
export class BUSCADOR { }
