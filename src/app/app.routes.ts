import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LandingComponent } from './landing/landing/landing.component';

export const routes: Routes = [
  {
    path: 'landing',
    component: LandingComponent,
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/features/auth.routes'),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/page.routes'),
  },
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
