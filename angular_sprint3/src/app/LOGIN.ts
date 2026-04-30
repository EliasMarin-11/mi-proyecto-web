// ... existing code ...
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/login/login.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, LoginComponent],
  templateUrl: './LOGIN.html',
})
export class LOGIN {
}
