import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './LOGIN.html',
})
export class LOGIN {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  });

  async onLogin() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login(email!, password!);
      alert('¡Bienvenido de nuevo!');
      this.router.navigate(['/buscar']);
    } catch (error: any) {
      alert('Credenciales incorrectas');
    }
  }
}
