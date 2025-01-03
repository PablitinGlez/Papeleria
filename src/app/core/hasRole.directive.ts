import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User, UserRole } from 'backend';
import { toSignal } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[hasRole]',
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);

  private user = toSignal(inject(AuthService).currentUser$);

  roles = input.required<UserRole[]>({
    alias: 'hasRole',
  });

  constructor() {
    effect(() => {
      const user = this.user();
      const roles = this.roles();

      this.viewContainerRef.clear();

      if (user && roles.length > 0 && this.hasRole(user, roles)) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    });
  }

  hasRole(user: User, roles: UserRole[]) {
    return user.roles.some((role) => roles.includes(role));
  }
}
