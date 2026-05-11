import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
// Importamos los componentes nativos de Ionic
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonCheckbox } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  standalone: true,
  // Añadimos las etiquetas de Ionic a los imports
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonCheckbox],
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
