import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard'), // public
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders'), // sales
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports'), // manager
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin'), // admin
  },
] as Routes;
