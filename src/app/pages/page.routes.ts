import { Routes } from '@angular/router';
import { AccessDeniedComponent } from '../components/accessdenied/accessdenied.component';
import { roleGuard } from '../core/guards/role.guards';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';

// IDs de roles
const ADMIN_ROLE = '678c7655383a3ce77acb0ce3';
const VISUALIZER_ROLE = '67ad61fb6d8408392bcb0ce2';
const EDITOR_ROLE = '678c7655383a3ce77acb0ce5';
const USER_ROLE = '678c7655383a3ce77acb0ce4';

// Definir qué roles pueden acceder a cada ruta
const ALL_ROLES = [ADMIN_ROLE, VISUALIZER_ROLE, EDITOR_ROLE, USER_ROLE];
const MODIFY_ROLES = [ADMIN_ROLE, EDITOR_ROLE];
const ADMIN_ONLY = [ADMIN_ROLE];

export default [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./users/users.component').then((m) => m.UsersComponent),
        canActivate: [roleGuard([ADMIN_ROLE, EDITOR_ROLE, VISUALIZER_ROLE])], // Solo admin, editor y visualizador
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./products/products.component').then(
            (m) => m.ProductsComponent,
          ),
        canActivate: [roleGuard([ADMIN_ROLE, EDITOR_ROLE, VISUALIZER_ROLE])], //
      },
      {
        path: 'productos-categoria/:id',
        loadComponent: () =>
          import(
            '../../app/components/productos-categoria/productos-categoria.component'
          ).then((m) => m.ProductosCategoriaComponent),
        canActivate: [roleGuard(ALL_ROLES)],
      },
      {
        path: 'producto-detail/:id',
        loadComponent: () =>
          import(
            '../../app/components/producto-detail/producto-detail.component'
          ).then((m) => m.ProductoDetailComponent),
        canActivate: [roleGuard(ALL_ROLES)],
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./categories/categories.component').then(
            (m) => m.CategoriasComponent,
          ),
        canActivate: [roleGuard(ALL_ROLES)],
      },
      {
        path: 'marcas',
        loadComponent: () =>
          import('./employees/employees.component').then(
            (m) => m.MarcasComponent,
          ),
        canActivate: [roleGuard(ALL_ROLES)],
      },
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./suppliers/suppliers.component').then(
            (m) => m.SuppliersComponent,
          ),
        canActivate: [roleGuard(ALL_ROLES)],
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./sales/sales.component').then((m) => m.SalesComponent),
        canActivate: [roleGuard(ALL_ROLES)],
      },
      // Ruta para acceso denegado
      {
        path: 'access-denied',
        component: AccessDeniedComponent,
      },

      // Add this to your routes array:
      {
        path: 'administradores',
        loadComponent: () =>
          import('./administradores/administradores.component').then(
            (m) => m.AdministradoresComponent,
          ),
      },

      {
        path: 'categories',
        loadComponent: () =>
          import('./categorias/categorias.component').then(
            (m) => m.CategoriasComponent,
          ),
      },

      {
        path: 'empleados',
        loadComponent: () =>
          import('./empleados/empleados.component').then(
            (m) => m.EmpleadosComponent,
          ),
      },

      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
] as Routes;
