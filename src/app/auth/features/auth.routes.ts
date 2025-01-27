import { Routes } from '@angular/router';

export default [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./sign-up/sign-up.component').then((m) => m.SignUpComponent),
  },
] as Routes;
