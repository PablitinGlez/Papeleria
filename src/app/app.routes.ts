import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login'), // public
  },
  {
    canMatch: [authGuard],
    path: '',
    loadComponent: () => import('./pages/page-layout'),
    loadChildren: () => import('./pages/page.routes'),
  },
];
