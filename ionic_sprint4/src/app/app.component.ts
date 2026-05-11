import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { DatabaseService } from './services/database.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private platform = inject(Platform);
  private databaseService = inject(DatabaseService);

  constructor() {
    this.initializeApp();
  }

  async initializeApp() {
    // Esperamos a que el dispositivo (iOS/Android) esté preparado
    await this.platform.ready();
    // Encendemos nuestra base de datos local
    await this.databaseService.initializePlugin();
  }
}
