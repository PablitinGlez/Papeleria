import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { UsersComponent } from './users/users.component';
UsersComponent



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
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./products/products.component').then(
            (m) => m.ProductsComponent,
          ),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./categories/categories.component').then(
            (m) => m.CategoriesComponent,
          ),
      },
      {
        path: 'empleados',
        loadComponent: () =>
          import('./employees/employees.component').then(
            (m) => m.EmployeesComponent,
          ),
      },
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./suppliers/suppliers.component').then(
            (m) => m.SuppliersComponent,
          ),
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./sales/sales.component').then((m) => m.SalesComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
] as Routes;
