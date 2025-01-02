import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { User, users } from 'backend';
import { AuthService } from '../auth/auth.service';
import HeaderSelector from './header-selector';

@Component({
  selector: 'app-header',
  template: `
    <header class="max-w-screen-lg mx-auto p-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">App Roles</h1>

        <nav class="flex space-x-4">
          <a
            [routerLinkActiveOptions]="{ exact: true }"
            routerLinkActive="text-indigo-600"
            routerLink="/"
            >Dashboard</a
          >
          <a routerLinkActive="text-indigo-600" routerLink="/orders"
            >Ordernes</a
          >
          <a routerLinkActive="text-indigo-600" routerLink="/reports"
            >Reportes</a
          >
          <a routerLinkActive="text-indigo-600" routerLink="/admin">Admin</a>
        </nav>

        <app-header-selector
          (logout)="logout()"
          (userChanged)="selectedUser($event)"
          [currentUser]="currentUser()"
          [users]="users()"
        />
      </div>
    </header>
  `,
  imports: [RouterLink, HeaderSelector, RouterLinkActive],
})
export default class Header {
  private _authService = inject(AuthService);

  currentUser = toSignal(this._authService.currentUser$);

  users = signal(users);

  logout() {
    this._authService.logout();
  }

  selectedUser(user: User) {
    this._authService.login(user.email).subscribe();
  }
}
