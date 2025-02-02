import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LandingComponent } from './landing/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent, // Ruta raíz (página de inicio)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/features/auth.routes'),
  },
  {
    canMatch: [authGuard],
    path: 'dashboard', // Ruta protegida para usuarios autenticados
    loadComponent: () => import('./pages/page-layout'),
    loadChildren: () => import('./pages/page.routes'),
  },
];