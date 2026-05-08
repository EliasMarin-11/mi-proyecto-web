import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { User, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, setDoc, onSnapshot } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { RecetasService, Receta } from '../../services/recetas.service'; // <--- IMPORTACIÓN NUEVA
// IMPORTA EL COMPONENTE DE TU TARJETA
import { Tarjeta_receta_verticalComponent } from '../tarjeta_receta_vertical/tarjeta_receta_vertical.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  // AÑADIMOS LA TARJETA A LOS IMPORTS
  imports: [CommonModule, FormsModule, Tarjeta_receta_verticalComponent],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit, OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private recetasService: RecetasService = inject(RecetasService); // <--- SERVICIO INYECTADO

  usuarioActual: User | null = null;
  cargandoAuth = true;
  editandoNombre = false;
  nuevoNombre = '';
  fotoGuardada: string | null = null;
  nuevaFotoPreview: string | null = null;
  emailUsuario = '';
  planUsuario = 'Básico';

  editandoPassword = false;
  passActual = '';
  passNueva = '';

  // NUEVA VARIABLE PARA GUARDAR LAS RECETAS DEL USUARIO
  misRecetas: Receta[] = [];

  private userSub?: Subscription;
  private unsubscribeSnapshot?: () => void;

  ngOnInit() {
    this.userSub = this.authService.user$.subscribe(async user => {
      this.usuarioActual = user;

      if (user) {
        this.emailUsuario = user.email || '';

        if (!this.editandoNombre) {
          this.nuevoNombre = user.displayName || user.email?.split('@')[0] || 'USUARIO';
        }

        // --- NUEVA LÓGICA: CARGAR MIS RECETAS ---
        try {
          this.misRecetas = await this.recetasService.getRecetasPorUsuario(user.uid);
        } catch (error) {
          console.error("Error al cargar recetas del usuario:", error);
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
                if (data && data['plan']) {
                  this.planUsuario = data['plan'];
                }
                // NUEVO: Obligamos a Angular a leer el nombre real de la base de datos
                if (data && data['nombre'] && !this.editandoNombre) {
                  this.nuevoNombre = data['nombre'];
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
        this.misRecetas = []; // Limpiamos las recetas si cierra sesión
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
    if (!this.usuarioActual) return;

    try {
      if (this.nuevaFotoPreview || this.nuevoNombre) {
        const docRef = doc(this.firestore, 'usuarios', this.usuarioActual.uid);

        await setDoc(docRef, {
          avatar: this.nuevaFotoPreview || this.fotoGuardada,
          nombre: this.nuevoNombre,
          email: this.usuarioActual.email
        }, {merge: true});

        if (this.nuevaFotoPreview) {
          this.fotoGuardada = this.nuevaFotoPreview;
        }
      }

      if (this.nuevoNombre.trim() !== '' && this.nuevoNombre !== this.usuarioActual.displayName) {
        await this.authService.actualizarPerfilUsuario(this.nuevoNombre, '');
        this.usuarioActual = {...this.usuarioActual, displayName: this.nuevoNombre} as User;
      }

      this.editandoNombre = false;
      this.nuevaFotoPreview = null;
      this.cdr.detectChanges();
      alert("¡Guardado correctamente!");

    } catch (error: any) {
      console.error(error);
      alert("Error al guardar.");
    }
  }

  mostrarCamposPassword() {
    this.editandoPassword = true;
    this.cdr.detectChanges();
  }

  cancelarEdicionPassword() {
    this.editandoPassword = false;
    this.passActual = '';
    this.passNueva = '';
    this.cdr.detectChanges();
  }

  async actualizarPassword() {
    if (!this.usuarioActual || !this.usuarioActual.email) return;
    if (!this.passActual || !this.passNueva) {
      alert('Rellena ambas contraseñas.');
      return;
    }
    if (this.passNueva.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const cred = EmailAuthProvider.credential(this.usuarioActual.email, this.passActual);
      await reauthenticateWithCredential(this.usuarioActual, cred);
      await updatePassword(this.usuarioActual, this.passNueva);

      alert('Contraseña actualizada con éxito.');
      this.cancelarEdicionPassword();
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') alert('La contraseña actual es incorrecta.');
      else alert('Error al actualizar la contraseña.');
    }
  }

  irAPlanes() {
    this.router.navigate(['/premium']);
  }

  // NUEVA FUNCIÓN PARA EL BOTÓN
  irASubirReceta() {
    this.router.navigate(['/subir-receta']);
  }

  cerrarSesion() {
    this.authService.logout().then(() => this.router.navigate(['/login']));
  }
}
