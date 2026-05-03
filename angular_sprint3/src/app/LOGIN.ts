import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginComponent],
  templateUrl: './LOGIN.html',
})
export class LOGIN {
}
