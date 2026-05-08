// ... existing code ...
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './login_registro.component.css'
})
export class RegistroComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  registroForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmarPassword: new FormControl('', [Validators.required])
  });

  async onRegistro() {
    if (this.registroForm.invalid) {
      alert('Por favor, rellena todos los campos correctamente. Recuerda que la contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const { email, password, confirmarPassword } = this.registroForm.value;

    if (password !== confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      await this.authService.registro(email!, password!);
      alert('¡Usuario registrado con éxito!');
      this.router.navigate(['/login']);
    } catch (error: any) {
      alert('Error al registrar: ' + error.message);
    }
  }
}
