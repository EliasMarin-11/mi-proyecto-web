import { Injectable, inject } from '@angular/core';
import {Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);

  public user$: Observable<User | null> = authState(this.auth);

  registro(email: string, pass: string) {
    return createUserWithEmailAndPassword(this.auth, email, pass);
  }

  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  logout() {
    return signOut(this.auth);
  }
}
