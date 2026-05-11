import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormGroup, FormControl, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth';
// Importamos los componentes de Ionic
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonCheckbox,
  IonLabel
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-registro',
  standalone: true,
  // Añadimos las etiquetas a los imports
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonCheckbox, IonLabel],
  templateUrl: './registro.component.html',
  styleUrl: './login_registro.component.css'
})
export class RegistroComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  registroForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellidos: new FormControl('', [Validators.required]), // Nuevo campo
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmarPassword: new FormControl('', [Validators.required]),
    foto: new FormControl(null) // Nuevo campo para la foto
  });

  // Método para capturar el archivo de imagen
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.registroForm.patchValue({foto: file});
    }
  }

  async onRegistro() {
    if (this.registroForm.invalid) {
      alert('Por favor, rellena todos los campos correctamente. Recuerda que la contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const {email, password, confirmarPassword, nombre, apellidos, foto} = this.registroForm.value;

    if (password !== confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      // 1. Forzamos a que si la foto es 'undefined', se envíe como 'null' para que TypeScript no se queje
      const fotoAEnviar = (foto as File | undefined) || null;

      await this.authService.registro(email!, password!, nombre!, apellidos!, fotoAEnviar);
      alert('¡Usuario registrado con éxito!');

      // 2. Le añadimos el await que te pide el aviso
      await this.router.navigate(['/login']);

    } catch (error: any) {
      alert('Error al registrar: ' + error.message);
    }
  }

