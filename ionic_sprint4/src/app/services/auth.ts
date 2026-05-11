import { Injectable, inject } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, sendPasswordResetEmail, updateProfile } from '@angular/fire/auth';import { Firestore, doc, setDoc } from '@angular/fire/firestore'; // Importamos Firestore
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage'; // Importamos Storage para la foto
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore); // Inyectamos la BD
  private storage: Storage = inject(Storage); // Inyectamos Storage

  public user$: Observable<User | null> = authState(this.auth).pipe(shareReplay(1));

  // Modificamos el método de registro para aceptar la info extra
  async registro(email: string, pass: string, nombre: string, apellidos: string, fotoFile: File | null) {
    try {
      // 1. Crear el usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
      const user = userCredential.user;

      let fotoUrl = '';

      // 2. Si hay foto, la subimos a Firebase Storage
      if (fotoFile) {
        // Creamos una referencia única para la foto del usuario
        const filePath = `usuarios/${user.uid}/perfil_${new Date().getTime()}`;
        const storageRef = ref(this.storage, filePath);

        // Subimos el archivo
        await uploadBytes(storageRef, fotoFile);

        // Obtenemos la URL de descarga pública
        fotoUrl = await getDownloadURL(storageRef);
      }

      // 3. Guardar la info extra en la Base de Datos (Firestore)
      const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
      await setDoc(userDocRef, {
        nombre: nombre,
        apellidos: apellidos,
        email: email,
        fotoPerfilUrl: fotoUrl, // Guardamos la URL de la foto (o un string vacío si no subió nada)
        fechaRegistro: new Date().toISOString()
      });

      return userCredential;

    } catch (error) {
      console.error("Error en el registro:", error);
      throw error;
    }
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
