import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-registro-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './REGISTRO.html',
})
export class REGISTRO {
  private authService = inject(AuthService);
  private router = inject(Router);

  registroForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  async onRegistro() {
    if (this.registroForm.invalid) return;

    const { email, password } = this.registroForm.value;
    try {
      await this.authService.registro(email!, password!);
      alert('¡Usuario registrado con éxito!');
      this.router.navigate(['/login']);
    } catch (error: any) {
      alert('Error al registrar: ' + error.message);
    }
  }
}
