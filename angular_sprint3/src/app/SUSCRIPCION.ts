import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-suscripcion-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './SUSCRIPCION.html',
})
export class SUSCRIPCION { }
