import { Injectable, inject } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, updateProfile, sendPasswordResetEmail } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);

  public user$: Observable<User | null> = authState(this.auth).pipe(shareReplay(1));

  registro(email: string, pass: string) {
    return createUserWithEmailAndPassword(this.auth, email, pass);
  }

  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  logout() {
    return signOut(this.auth);
  }

  actualizarPerfilUsuario(nombre: string, fotoUrl: string) {
    if (this.auth.currentUser) {
      return updateProfile(this.auth.currentUser, {
        displayName: nombre,
        photoURL: fotoUrl
      });
    }
    return Promise.reject('No user logged in');
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }
}
