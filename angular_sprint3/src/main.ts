import { bootstrapApplication } from '@angular/platform-browser';

import { Homepage } from './app/homepage';

bootstrapApplication(Homepage)
  .catch((err) => console.error(err));
