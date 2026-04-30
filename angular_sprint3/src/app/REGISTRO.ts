// ... existing code ...
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RegistroComponent } from './components/registro/registro.component';

@Component({
  selector: 'app-registro-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RegistroComponent],
  templateUrl: './REGISTRO.html',
})
export class REGISTRO {
}
