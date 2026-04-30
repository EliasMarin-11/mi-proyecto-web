import { Component } from '@angular/core';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [],
    templateUrl: './perfil.component.html',
    styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  cerrarSesion() {
    console.log("Cerrando sesión...");
    // Aquí irá la lógica de Firebase Auth más adelante
  }
}
