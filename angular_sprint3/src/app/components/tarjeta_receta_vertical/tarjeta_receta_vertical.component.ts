import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth'; // <--- IMPORTACIÓN NUEVA

@Component({
  selector: 'app-tarjeta_receta_vertical',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './tarjeta_receta_vertical.component.html',
  styleUrl: './tarjeta_receta_vertical.component.css'
})
export class Tarjeta_receta_verticalComponent implements OnInit {
  private authService = inject(AuthService); // <--- INYECCIÓN NUEVA

  @Input() recetaData: any;

  // Variables nuevas para seguridad
  usuarioActualId: string | null = null;
  esPropietario = false;

  ngOnInit() {
    // Obtenemos el usuario logueado
    this.authService.user$.subscribe(user => {
      this.usuarioActualId = user ? user.uid : null;

      // Comprobamos si es el dueño
      this.comprobarPropiedad();
    });
  }

  comprobarPropiedad() {
    if (this.recetaData && this.usuarioActualId) {
      this.esPropietario = this.recetaData.userId === this.usuarioActualId;
    } else {
      this.esPropietario = false;
    }
  }
}
