import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, setDoc, onSnapshot } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit, OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  usuarioActual: User | null = null;
  cargandoAuth = true;
  editandoNombre = false;
  nuevoNombre = '';
  fotoGuardada: string | null = null;
  nuevaFotoPreview: string | null = null;
  emailUsuario = '';

  private userSub?: Subscription;
  private unsubscribeSnapshot?: () => void;

  ngOnInit() {
    this.userSub = this.authService.user$.subscribe(user => {
      this.usuarioActual = user;

      if (user) {
        this.emailUsuario = user.email || '';

        if (!this.editandoNombre) {
          this.nuevoNombre = user.displayName || user.email?.split('@')[0] || 'USUARIO';
        }

        if (!this.unsubscribeSnapshot) {
          try {
            const userDocRef = doc(this.firestore, 'usuarios', user.uid);

            this.unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                if (data && data['avatar']) {
                  this.fotoGuardada = data['avatar'];
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
        this.fotoGuardada = null;
        this.emailUsuario = '';
      }

      this.cargandoAuth = false;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
    if (this.unsubscribeSnapshot) this.unsubscribeSnapshot();
  }

  activarEdicion() {
    this.editandoNombre = true;
    this.cdr.detectChanges();
  }

  onFotoSeleccionada(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.nuevaFotoPreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  async guardarCambios() {
    if (!this.usuarioActual) {
      alert("No hay usuario conectado.");
      return;
    }

    try {
      console.log("Iniciando guardado en Firestore y Auth...");
      if (this.nuevaFotoPreview || this.nuevoNombre) {
        const docRef = doc(this.firestore, 'usuarios', this.usuarioActual.uid);

        await setDoc(docRef, {
          avatar: this.nuevaFotoPreview || this.fotoGuardada,
          nombre: this.nuevoNombre,
          email: this.usuarioActual.email
        }, { merge: true });

        if (this.nuevaFotoPreview) {
          this.fotoGuardada = this.nuevaFotoPreview;
        }
      }

      if (this.nuevoNombre.trim() !== '' && this.nuevoNombre !== this.usuarioActual.displayName) {
        await this.authService.actualizarPerfilUsuario(this.nuevoNombre, '');

        this.usuarioActual = {
          ...this.usuarioActual,
          displayName: this.nuevoNombre
        } as User;
      }

      this.editandoNombre = false;
      this.nuevaFotoPreview = null;
      this.cdr.detectChanges();
      alert("¡Guardado correctamente!");

    } catch (error: any) {
      console.error("Error al guardar cambios:", error);
      alert("Error al guardar.");
    }
  }

  cambiarPassword() {
    if (this.emailUsuario) {
      this.authService.resetPassword(this.emailUsuario).then(() => {
        alert("Se ha enviado un correo para restablecer tu contraseña.");
      }).catch((error) => {
        console.error(error);
        alert("Hubo un error al enviar el correo.");
      });
    }
  }

  irAPlanes() {
    this.router.navigate(['/premium']);
  }

  cerrarSesion() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
