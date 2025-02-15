import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from 'src/app/auth/data-access/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      // Si el usuario está autenticado
      if (user) {
        // Redirige al dashboard si intenta acceder a landing o auth
        if (state.url.includes('/landing') || state.url.includes('/auth')) {
          return router.createUrlTree(['/dashboard']);
        }
        // Permite el acceso a otras rutas protegidas
        return true;
      }

      // Si el usuario no está autenticado
      if (state.url.includes('/dashboard')) {
        // Redirige al login si intenta acceder al dashboard sin autenticarse
        return router.createUrlTree(['/auth/login']);
      }

      // Permite el acceso a rutas públicas (landing, auth, etc.)
      return true;
    }),
  );
};
