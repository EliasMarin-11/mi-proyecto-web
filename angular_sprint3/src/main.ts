// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { Homepage } from './app/homepage';
import { routes } from './app/app.routes';

bootstrapApplication(Homepage, {
  providers: [provideRouter(routes)]
}).catch((err) => console.error(err));
