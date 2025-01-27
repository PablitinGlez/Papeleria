import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    //canActivateChild: [publicGuard()],
    path: 'auth',
    loadChildren: () => import('./auth/features/auth.routes'),
  },
  
  {
    canMatch: [authGuard],
    path: '',
    loadComponent: () => import('./pages/page-layout'),
    loadChildren: () => import('./pages/page.routes'),
  },
];
