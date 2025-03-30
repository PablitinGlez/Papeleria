import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';

export enum RoleType {
  ADMIN = 'Administrador',
  VISUALIZER = 'Visualizador',
  EDITOR = 'Editor',
  USER = 'Usuario',
  EMPLOYEE = 'Empleado', // Nuevo enum para Empleado
}

export interface Permission {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private _userPermissions = new BehaviorSubject<Permission>({
    read: true,
    create: false,
    update: false,
    delete: false,
  });

  public userPermissions$ = this._userPermissions.asObservable();

  constructor(private authService: AuthService) {
    // Suscribirse al usuario actual para actualizar permisos cuando cambie
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        const permissions = this.getPermissionsByRoleId(user.idRol);
        this._userPermissions.next(permissions);
      } else {
        // Si no hay usuario, resetear a permisos básicos
        this._userPermissions.next({
          read: true,
          create: false,
          update: false,
          delete: false,
        });
      }
    });
  }

  // Obtener permisos según el ID del rol
  private getPermissionsByRoleId(roleId: string): Permission {
    console.log('Checking permissions for roleId:', roleId); // Agregar este log
    // IDs de la base de datos que mostraste
    switch (roleId) {
      case '678c7655383a3ce77acb0ce3': // Administrador
        return {
          read: true,
          create: true,
          update: true,
          delete: true,
        };
      case '67ad61fb6d8408392bcb0ce2': // Visualizador
        return {
          read: true,
          create: false,
          update: false,
          delete: false,
        };
      case '678c7655383a3ce77acb0ce5': // Editor
        return {
          read: true,
          create: false,
          update: true,
          delete: false,
        };
      case '678c7655383a3ce77acb0ce4': // Usuario
        return {
          read: true,
          create: false,
          update: false,
          delete: false,
        };
      case '67e3020b08cac4115fcb0ce2': // Empleado (nuevo caso)
        return {
          read: true,
          create: true,
          update: true,
          delete: false, // Los empleados no pueden eliminar
        };
      default:
        return {
          read: true,
          create: false,
          update: false,
          delete: false,
        };
    }
  }

  // Verificar si el usuario tiene un permiso específico
  public hasPermission(permission: keyof Permission): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.userPermissions$.subscribe((permissions) => {
        observer.next(permissions[permission]);
        observer.complete();
      });
    });
  }

  // Método para obtener el nombre del rol según ID
  public getRoleName(roleId: string): string {
    switch (roleId) {
      case '678c7655383a3ce77acb0ce3':
        return RoleType.ADMIN;
      case '67ad61fb6d8408392bcb0ce2':
        return RoleType.VISUALIZER;
      case '678c7655383a3ce77acb0ce5':
        return RoleType.EDITOR;
      case '678c7655383a3ce77acb0ce4':
        return RoleType.USER;
      case '67e3020b08cac4115fcb0ce2': // Nuevo caso para Empleado
        return RoleType.EMPLOYEE;
      default:
        return 'Desconocido';
    }
  }

  // Método para obtener las opciones de menú permitidas por rol
  // En role.service.ts
  public getAllowedMenuOptions(roleId: string): {
    options: string[];
    showCatalogTitle: boolean;
  } {
    const menuOptions = [
      'dashboard',
      'usuarios',
      'productos',
      'categorias',
      'marcas',
      'proveedores',
      'empleados',
      'ventas',
      'config',
    ];

    switch (roleId) {
      case '678c7655383a3ce77acb0ce3': // Administrador
        return { options: menuOptions, showCatalogTitle: true };
      case '67ad61fb6d8408392bcb0ce2': // Visualizador
        return {
          options: menuOptions.filter((opt) => opt !== 'config'),
          showCatalogTitle: true,
        };
      case '678c7655383a3ce77acb0ce5': // Editor
        return {
          options: menuOptions.filter(
            (opt) => opt !== 'usuarios' && opt !== 'config',
          ),
          showCatalogTitle: true,
        };
      case '678c7655383a3ce77acb0ce4': // Usuario
        return { options: ['dashboard'], showCatalogTitle: false };
      case '67e3020b08cac4115fcb0ce2': // Empleado (nuevo caso)
        return {
          options: menuOptions.filter(
            (opt) =>
              opt !== 'usuarios' && opt !== 'empleados' && opt !== 'config',
          ),
          showCatalogTitle: true,
        };
      default:
        return { options: ['dashboard'], showCatalogTitle: false };
    }
  }
}
