// src/app/components/perfil/perfil.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';
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

  usuarioActual: User | null = null;
  cargandoAuth = true;
  editandoNombre = false;
  nuevoNombre = '';
  fotoGuardada: string | null = null;
  nuevaFotoPreview: string | null = null;

  private userSub?: Subscription;
  private docSub?: Subscription;

  ngOnInit() {
    this.userSub = this.authService.user$.subscribe(user => {
      this.usuarioActual = user;
      this.cargandoAuth = false; // Firebase Auth resolvió

      if (user) {
        // Solo inicializamos el nombre si no estamos editándolo manualmente
        if (!this.editandoNombre) {
          this.nuevoNombre = user.displayName || '';
        }

        // Suscripción independiente a Firestore
        if (!this.docSub) {
          const docRef = doc(this.firestore, `usuarios/${user.uid}`);
          this.docSub = docData(docRef).subscribe((data: any) => {
            this.fotoGuardada = data?.avatar || null;
          });
        }
      } else {
        if (this.docSub) {
          this.docSub.unsubscribe();
          this.docSub = undefined;
        }
        this.fotoGuardada = null;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
    if (this.docSub) this.docSub.unsubscribe();
  }

  activarEdicion() { this.editandoNombre = true; }

  onFotoSeleccionada(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.nuevaFotoPreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  async guardarCambios() {
    try {
      if (!this.usuarioActual) return;

      // 1. Guardamos la foto en Firestore
      if (this.nuevaFotoPreview) {
        const docRef = doc(this.firestore, `usuarios/${this.usuarioActual.uid}`);
        await setDoc(docRef, { avatar: this.nuevaFotoPreview }, { merge: true });
        this.fotoGuardada = this.nuevaFotoPreview; // Seteamos al momento para evitar un salto visual
      }

      // 2. Guardamos el nombre en Auth (solo si escribiste algo nuevo)
      if (this.nuevoNombre.trim() !== '' && this.nuevoNombre !== this.usuarioActual.displayName) {
        await this.authService.actualizarPerfilUsuario(this.nuevoNombre, '');
        // Forzamos actualización visual inmediata
        this.usuarioActual = { ...this.usuarioActual, displayName: this.nuevoNombre } as User;
      }

      this.editandoNombre = false;
      this.nuevaFotoPreview = null;
      alert("¡Guardado correctamente!");

    } catch (error: any) {
      console.error(error);
      alert("Error al guardar.");
    }
  }

  cerrarSesion() {
    this.authService.logout().then(() => this.router.navigate(['/login']));
  }
}
