import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UserRole } from 'backend';
import { map } from 'rxjs';
import { AuthService } from 'src/app/auth/data-access/auth.service';

// export const hasRoleGuard: CanActivateFn = (route, state) => {
//   const roles = route.data?.['roles'] as string[];

//   return inject(AuthService).currentUser$.pipe(
//     map((user) => {
//       if (!user) return false;

//       return user.roles.some((role) => roles.includes(role));
//     }),
//   );
// };

export const hasRoleGuard = (roles: UserRole[]): CanActivateFn => {
  return () => {
    return inject(AuthService).currentUser$.pipe(
      map((user) => {
        if (!user) return false;

        return user.roles.some((role) => roles.includes(role));
      }),
    );
  };
};
