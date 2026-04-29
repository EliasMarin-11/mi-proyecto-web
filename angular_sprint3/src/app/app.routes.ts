import { Routes } from '@angular/router';

// 1. IMPORTAMOS TUS PÁGINAS FINALES (las que están en la raíz de /app)
import { LOGIN } from './LOGIN';
import { REGISTRO } from './REGISTRO';
import { FAVORITOS } from './FAVORITOS';
import { PERFIL } from './PERFIL';
import { SUSCRIPCION } from './SUSCRIPCION';
import { SUBIR_RECETA } from './SUBIR_RECETA';
import { BUSCADOR } from './BUSCADOR';
import { VER_RECETA } from './VER_RECETA';

export const routes: Routes = [
  { path: 'login', component: LOGIN },
  { path: 'registro', component: REGISTRO },
  { path: 'favoritos', component: FAVORITOS },
  { path: 'perfil', component: PERFIL },
  { path: 'premium', component: SUSCRIPCION },
  { path: 'subir-receta', component: SUBIR_RECETA },
  { path: 'buscar', component: BUSCADOR },
  { path: 'ver-receta', component: VER_RECETA },

  // Página de inicio (si no escriben nada en la URL)
  // Aquí podrías crear una página llamada INICIO o redirigir a BUSCADOR
  { path: '', redirectTo: 'buscar', pathMatch: 'full' },

  // Comodín para errores de escritura
  { path: '**', redirectTo: '' }
];
