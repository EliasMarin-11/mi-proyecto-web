import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-ver_receta-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './VER_RECETA.html',
})
export class VER_RECETA { }
