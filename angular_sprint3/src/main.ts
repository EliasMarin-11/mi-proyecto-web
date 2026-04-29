// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { Homepage } from './app/homepage';
import { routes } from './app/app.routes';


import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDTFYraDrDNBZIooDV8O7STnqthOC9pr_Q",
  authDomain: "whats-in-your-fridge-241d1.firebaseapp.com",
  projectId: "whats-in-your-fridge-241d1",
  storageBucket: "whats-in-your-fridge-241d1.firebasestorage.app",
  messagingSenderId: "797998749949",
  appId: "1:797998749949:web:ce9631a865b8b0bd068694"
};


bootstrapApplication(Homepage, {
  providers: [
    provideRouter(routes),

    // Conectamos Angular con Firebase
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ]
}).catch((err) => console.error(err));
