import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from 'src/app/auth/data-access/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  return inject(AuthService).currentUser$.pipe(
    map((user) => {
      if (user) {
        // Si el usuario está autenticado, permite el acceso
        return true;
      }

      // Si el usuario no está autenticado, redirige a la página de login
      return router.createUrlTree(['/']);
    }),
  );
};
