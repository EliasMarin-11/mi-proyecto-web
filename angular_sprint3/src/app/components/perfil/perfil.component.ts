import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  usuarioActual: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Escuchamos los cambios en la sesión
    this.authService.user$.subscribe(user => {
      this.usuarioActual = user;
    });
  }

  cerrarSesion() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']); // Redirigir tras cerrar sesión
    });
  }
}
