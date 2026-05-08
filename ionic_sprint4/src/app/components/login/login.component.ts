
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login_registro.component.css'
})
export class LoginComponent {
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
      this.router.navigate(['/inicio']);
    } catch (error: any) {
      alert('Credenciales incorrectas');
    }
  }
}
