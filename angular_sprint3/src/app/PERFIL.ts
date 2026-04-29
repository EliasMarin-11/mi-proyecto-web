import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './PERFIL.html',
})
export class PERFIL { }
