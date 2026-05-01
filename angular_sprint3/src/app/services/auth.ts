import { Injectable, inject } from '@angular/core';
import { Auth, user, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, updateProfile } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);

  public user$: Observable<User | null> = user(this.auth);

  registro(email: string, pass: string) {
    return createUserWithEmailAndPassword(this.auth, email, pass);
  }

  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  logout() {
    return signOut(this.auth);
  }

  async actualizarPerfilUsuario(nombre: string, fotoUrl: string) {
    if (this.auth.currentUser) {
      await updateProfile(this.auth.currentUser, {
        displayName: nombre,
        photoURL: fotoUrl
      });
      await this.auth.currentUser.reload();
    }
  }
}
