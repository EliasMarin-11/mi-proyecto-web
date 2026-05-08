import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { User } from '@angular/fire/auth';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
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
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  menuAbierto = false;
  user: User | null = null;
  fotoPerfil: string | null = null;

  private userSub?: Subscription;
  private unsubscribeSnapshot?: () => void;

  ngOnInit() {
    this.userSub = this.authService.user$.subscribe(userData => {
      this.user = userData;

      if (userData) {
        if (!this.unsubscribeSnapshot) {
          try {
            const userDocRef = doc(this.firestore, 'usuarios', userData.uid);
            this.unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                if (data && data['avatar']) {
                  this.fotoPerfil = data['avatar'];
                }
              }
              this.cdr.detectChanges();
            }, (error) => {
              console.error(error);
            });
          } catch (error) {
            console.error(error);
          }
        }
      } else {
        if (this.unsubscribeSnapshot) {
          this.unsubscribeSnapshot();
          this.unsubscribeSnapshot = undefined;
        }
        this.fotoPerfil = null;
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
    if (this.unsubscribeSnapshot) this.unsubscribeSnapshot();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
    this.cdr.detectChanges();
  }

  cerrarMenu() {
    this.menuAbierto = false;
    this.cdr.detectChanges();
  }

  goToProfile() {
    this.router.navigate(['/perfil']);
  }
}
