import { Routes } from '@angular/router';
import { hasRoleGuard } from '../core/guards/has-role.guard';

export default [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard'), // public
  },
  {
    path: 'orders',
    canActivate: [hasRoleGuard(['sales', 'admin'])],
    loadComponent: () => import('./orders/orders'), // sales
  },
  {
    path: 'reports',
    canActivate: [hasRoleGuard(['manager', 'admin'])],
    loadComponent: () => import('./reports/reports'), // manager
  },
  {
    path: 'admin',
    canActivate: [hasRoleGuard(['admin'])],
    loadComponent: () => import('./admin/admin'), // admin
  },
] as Routes;
