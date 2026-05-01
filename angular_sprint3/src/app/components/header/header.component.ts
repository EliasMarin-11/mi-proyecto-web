// src/app/components/header/header.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { User } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  menuAbierto = false;
  user: User | null = null;
  fotoPerfil: string | null = null;

  private userSub?: Subscription;
  private docSub?: Subscription;

  ngOnInit() {
    this.userSub = this.authService.user$.subscribe(userData => {
      this.user = userData;
      if (userData) {
        // Solo nos suscribimos a Firestore si no lo hemos hecho ya para este usuario
        if (!this.docSub) {
          const docRef = doc(this.firestore, `usuarios/${userData.uid}`);
          this.docSub = docData(docRef).subscribe((data: any) => {
            this.fotoPerfil = data?.avatar || null;
          });
        }
      } else {
        // Si cierra sesión, limpiamos todo
        if (this.docSub) {
          this.docSub.unsubscribe();
          this.docSub = undefined;
        }
        this.fotoPerfil = null;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
    if (this.docSub) this.docSub.unsubscribe();
  }

  toggleMenu() { this.menuAbierto = !this.menuAbierto; }
  cerrarMenu() { this.menuAbierto = false; }
  goToProfile() { this.router.navigate(['/perfil']); }
}
