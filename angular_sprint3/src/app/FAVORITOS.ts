import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-favoritos-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './FAVORITOS.html',
})
export class FAVORITOS { }
