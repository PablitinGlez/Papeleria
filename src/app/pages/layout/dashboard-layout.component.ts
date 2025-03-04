// layout/dashboard-layout.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { LogoutButtonComponent } from "../../components/logout/logout.component";

@Component({
  selector: 'app-dashboard-layout',
  styleUrls: ['../dashboard/dashboard.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LogoutButtonComponent,
  ],

  template: `
    <div class="app">
      <!-- Header fijo -->
      <div class="header">
        <div class="dark-light" (click)="toggleTheme()">
          <svg
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </div>
        <div class="menu-circle"></div>

        <div class="search-bar">
          <input type="text" placeholder="Search" />
        </div>
        <div class="header-profile">
          <div class="notification">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-bell"
            >
              <path
                d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
              />
            </svg>
          </div>
          <svg viewBox="0 0 512 512" fill="currentColor">
            <path
              d="M448.773 235.551A135.893 135.893 0 00451 211c0-74.443-60.557-135-135-135-47.52 0-91.567 25.313-115.766 65.537-32.666-10.59-66.182-6.049-93.794 12.979-27.612 19.013-44.092 49.116-45.425 82.031C24.716 253.788 0 290.497 0 331c0 7.031 1.703 13.887 3.006 20.537l.015.015C12.719 400.492 56.034 436 106 436h300c57.891 0 106-47.109 106-105 0-40.942-25.053-77.798-63.227-95.449z"
            />
          </svg>
          <img
            class="profile-img"
            [src]="
              currentUser?.imageUrl ||
              currentUser?.photoURL ||
              defaultProfileImage
            "
            [alt]="currentUser?.nombre || currentUser?.displayName || 'Profile'"
            (error)="handleImageError($event)"
          />
        </div>
      </div>

      <div class="wrapper">
        <!-- Sidebar fijo -->
        <div class="left-side">
          <div class="side-wrapper">
            <h4 class="side-title">Papeleria</h4>
            <div class="side-menu">
              <a routerLink="/dashboard" routerLinkActive="active">
                <svg viewBox="0 0 512 512">
                  <g xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path
                      d="M0 0h128v128H0zm0 0M192 0h128v128H192zm0 0M384 0h128v128H384zm0 0M0 192h128v128H0zm0 0"
                      data-original="#bfc9d1"
                    />
                  </g>
                  <path
                    xmlns="http://www.w3.org/2000/svg"
                    d="M192 192h128v128H192zm0 0"
                    fill="currentColor"
                    data-original="#82b1ff"
                  />
                  <path
                    xmlns="http://www.w3.org/2000/svg"
                    d="M384 192h128v128H384zm0 0M0 384h128v128H0zm0 0M192 384h128v128H192zm0 0M384 384h128v128H384zm0 0"
                    fill="currentColor"
                    data-original="#bfc9d1"
                  />
                </svg>
                Dashboard
              </a>
            </div>
          </div>
          <div class="side-wrapper">
            <div class="side-title">Catalogos</div>
            <div class="side-menu">
              <a routerLink="/usuarios" routerLinkActive="active">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  width="24"
                  height="24"
                  stroke-width="1.85"
                >
                  <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
                  <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"></path>
                </svg>
                Usuarios
              </a>
              <a routerLink="/productos" routerLinkActive="active">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  width="24"
                  height="24"
                  stroke-width="1.25"
                >
                  <path d="M17 3l4 4l-14 14l-4 -4z"></path>
                  <path d="M16 7l-1.5 -1.5"></path>
                  <path d="M13 10l-1.5 -1.5"></path>
                  <path d="M10 13l-1.5 -1.5"></path>
                  <path d="M7 16l-1.5 -1.5"></path>
                </svg>
                Productos
              </a>
              <a routerLink="/categorias" routerLinkActive="active">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  width="24"
                  height="24"
                  stroke-width="1.25"
                >
                  <path d="M14 4h6v6h-6z"></path>
                  <path d="M4 14h6v6h-6z"></path>
                  <path d="M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                  <path d="M7 7m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                </svg>
                Categorias
              </a>
              <a routerLink="/empleados" routerLinkActive="active">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  width="28"
                  height="28"
                  stroke-width="1.25"
                >
                  <path
                    d="M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"
                  ></path>
                  <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2"></path>
                  <path d="M12 12l0 .01"></path>
                  <path d="M3 13a20 20 0 0 0 18 0"></path>
                </svg>
                Empleados
              </a>
              <a routerLink="/proveedores">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  width="28"
                  height="28"
                  stroke-width="1.25"
                >
                  <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5"></path>
                  <path d="M12 12l8 -4.5"></path>
                  <path d="M12 12l0 9"></path>
                  <path d="M12 12l-8 -4.5"></path>
                  <path d="M16 5.25l-8 4.5"></path>
                </svg>
                Proveedores
              </a>
              <a routerLink="/ventas" routerLinkActive="active">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  width="28"
                  height="28"
                  stroke-width="1.25"
                >
                  <path
                    d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"
                  ></path>
                  <path
                    d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"
                  ></path>
                  <path
                    d="M14 11h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5"
                  ></path>
                  <path d="M12 17v1m0 -8v1"></path>
                </svg>
                Ventas
              </a>
            </div>
            <hr class="divider" />
          </div>

          <div class="side-wrapper">
            <div class="side-menu">
              <a routerLink="/dashboard/sales" routerLinkActive="active">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"></path>
                  <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path>
                  <path d="M12 15v3"></path>
                </svg>
                Configuración
              </a>
            </div>
          </div>

          <!-- Botón de Cierre de Sesión -->
          <app-logout-button></app-logout-button>
        </div>

        <!-- Contenido dinámico -->
        <div class="main-container">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent {
  isLightMode: boolean = false;
  currentUser: any = null;
  private userSubscription: Subscription | undefined;
  defaultProfileImage =
    'https://res.cloudinary.com/dxgriy1hu/image/upload/v1739936608/ICONOS-27_mtjxlg.png';

  constructor(private authService: AuthService) {
    // Establecer el tema claro como predeterminado
    this.isLightMode = true;
    document.body.classList.add('light-mode');
  }

  ngOnInit() {
    // Subscribe to the current user observable
    this.userSubscription = this.authService.currentUser$.subscribe(
      (user) => {
        this.currentUser = user;
        console.log('Current user updated:', user);
      },
      (error) => {
        console.error('Error getting current user:', error);
      },
    );
  }

  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  handleImageError(event: any) {
    // If the image fails to load, fallback to default image
    event.target.src = this.defaultProfileImage;
  }

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    document.body.classList.toggle('light-mode', this.isLightMode);
  }
}
