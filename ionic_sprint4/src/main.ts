import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/principales/app.routes';
import { AppComponent } from './app/app.component';

// Importaciones de Firebase de tu antiguo proyecto
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

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Conectamos Angular con Firebase en tu nueva app Ionic
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
}).catch(err => console.error(err));
