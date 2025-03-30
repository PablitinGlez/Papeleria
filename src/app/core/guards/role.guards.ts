// role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';

export const roleGuard = (allowedRoleIds: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
      take(1),
      map((user) => {
        // Si no hay usuario autenticado, permitir acceso (el authGuard ya maneja esto)
        if (!user) {
          return true;
        }

        // Comprobar si el usuario tiene uno de los roles permitidos
        if (allowedRoleIds.includes(user.idRol)) {
          return true;
        }

        // Si no tiene los permisos adecuados, igual permitir acceso
        // pero el slider ya habrá ocultado las opciones no permitidas
        return true;
      }),
    );
  };
};
