import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-registro-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './REGISTRO.html',
})
export class REGISTRO { }
