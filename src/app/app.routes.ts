import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LandingComponent } from './landing/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent, // Página de inicio si no está autenticado
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/features/auth.routes'), // Rutas de autenticación
  },
  {
    path: 'dashboard',
    canActivate: [authGuard], // Protección con authGuard
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },

  
];
