import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-suscripcion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suscripcion.component.html',
  styleUrl: './suscripcion.component.css'
})
export class SuscripcionComponent {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  async seleccionarPlan(tipoPlan: string) {
    const confirmacion = confirm(`¿Estás seguro de que quieres cambiar al plan ${tipoPlan.toUpperCase()}?`);

    if (confirmacion) {
      this.authService.user$.subscribe(async (user) => {
        if (user) {
          try {
            const userDocRef = doc(this.firestore, 'usuarios', user.uid);

            // Guardamos o actualizamos el plan en Firestore
            await setDoc(userDocRef, { plan: tipoPlan }, { merge: true });

            alert(`¡Felicidades! Has cambiado al plan ${tipoPlan}.`);
            this.router.navigate(['/perfil']); // Volvemos al perfil

          } catch (error) {
            console.error("Error actualizando plan:", error);
            alert("Hubo un error al actualizar el plan.");
          }
        } else {
          alert("Debes iniciar sesión para suscribirte a un plan.");
          this.router.navigate(['/login']);
        }
      });
    }
  }
}
