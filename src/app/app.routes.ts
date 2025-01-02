import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login'), // public
  },
  {
    path: '',
    loadComponent: () => import('./pages/page-layout'),
    loadChildren: () => import('./pages/page.routes'),
  },
];
