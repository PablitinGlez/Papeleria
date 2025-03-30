import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { LockIconComponent } from '../../components/lockicon/lockicon.component';
import { LogoutButtonComponent } from '../../components/logout/logout.component';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { Permission, RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-dashboard-layout',
  styleUrls: ['../dashboard/dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LogoutButtonComponent,
    HasPermissionDirective,
    LockIconComponent,
    RouterLink,
  ],

  template: `
    <div class="app">
      <!-- Header fijo -->

      <div class="header">
        <!---->
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

        <div class="header-profile">
          <a routerLink="profile"
            ><img
              class="profile-img"
              [src]="
                currentUser?.imageUrl ||
                currentUser?.photoURL ||
                defaultProfileImage
              "
              [alt]="
                currentUser?.nombre || currentUser?.displayName || 'Profile'
              "
              (error)="handleImageError($event)"
          /></a>

          <div class="role-badge" *ngIf="currentUser?.idRol">
            {{ getRoleName() }}
          </div>
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
          <div
            class="side-wrapper"
            *ngIf="showCatalogTitle && allowedMenuOptions.length > 1"
          >
            <div class="side-title">Catalogos</div>
            <div class="side-menu">
              <!-- Opción de Usuarios con permiso -->
              <div class="menu-item-container">
                <a
                  routerLink="/usuarios"
                  routerLinkActive="active"
                  *ngIf="isMenuAllowed('usuarios')"
                >
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
              </div>

              <!-- Opción de Productos con permiso -->
              <div class="menu-item-container">
                <a
                  routerLink="/productos"
                  routerLinkActive="active"
                  *ngIf="isMenuAllowed('productos')"
                >
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
              </div>

              <!-- Opción de Categorías con permiso -->
              <div class="menu-item-container">
                <a
                  routerLink="/categorias"
                  routerLinkActive="active"
                  *ngIf="isMenuAllowed('categorias')"
                >
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
              </div>

              <!-- Opción de Empleados con permiso -->
              <div class="menu-item-container">
                <a
                  routerLink="/marcas"
                  routerLinkActive="active"
                  *ngIf="isMenuAllowed('marcas')"
                >
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
                  Marcas
                </a>
              </div>

              <!-- Opción de Proveedores con permiso -->
              <div class="menu-item-container">
                <a
                  routerLink="/proveedores"
                  routerLinkActive="active"
                  *ngIf="isMenuAllowed('proveedores')"
                >
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
              </div>

              <div class="menu-item-container">
                <a
                  routerLink="/empleados"
                  routerLinkActive="active"
                  *ngIf="isMenuAllowed('empleados')"
                >
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
                  Empleados
                </a>
                <ng-template #categoriasLocked>
                  <div class="menu-item-locked">
                    <a class="disabled">
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
                        class="disabled-icon"
                      >
                        <path d="M14 4h6v6h-6z"></path>
                        <path d="M4 14h6v6h-6z"></path>
                        <path
                          d="M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"
                        ></path>
                        <path d="M7 7m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                      </svg>
                      Categorias
                    </a>
                    <app-lock-icon
                      tooltipMessage="No tienes permiso para acceder a Categorías"
                    ></app-lock-icon>
                  </div>
                </ng-template>
              </div>

              <!-- Opción de Ventas con permiso -->
              <div class="menu-item-container">
                <a
                  routerLink="/ventas"
                  routerLinkActive="active"
                  *ngIf="isMenuAllowed('ventas')"
                >
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
            </div>
            <hr class="divider" />
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
  styles: [
    `
      .menu-item-container {
        position: relative;
        display: flex;
        align-items: center;
      }

      .menu-item-locked {
        display: flex;
        align-items: center;
        width: 100%;
      }

      .menu-item-locked .disabled {
        opacity: 0.6;
        pointer-events: none;
        flex-grow: 1;
      }

      .disabled-icon {
        opacity: 0.6;
      }

      .role-badge {
        background-color: #4caf50;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.7rem;
        margin-left: 10px;
      }
    `,
  ],
})
export class DashboardLayoutComponent {
  isLightMode: boolean = false;
  currentUser: any = null;
  private userSubscription: Subscription | undefined;
  defaultProfileImage =
    'https://res.cloudinary.com/dxgriy1hu/image/upload/v1739936608/ICONOS-27_mtjxlg.png';

  allowedMenuOptions: string[] = [];
  showCatalogTitle: boolean = true;
  // Propiedad para exponer enum Permission al template
  Permission = {
    READ: 'read' as keyof Permission,
    CREATE: 'create' as keyof Permission,
    UPDATE: 'update' as keyof Permission,
    DELETE: 'delete' as keyof Permission,
  };

  constructor(
    private authService: AuthService,
    private roleService: RoleService,
  ) {
    // Establecer el tema claro como predeterminado
    this.isLightMode = true;
    document.body.classList.add('light-mode');
  }

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(
      (user) => {
        this.currentUser = user;
        console.log('Current user updated:', user);
        if (user && user.idRol) {
          const menuData = this.roleService.getAllowedMenuOptions(user.idRol);
          this.allowedMenuOptions = menuData.options;
          this.showCatalogTitle = menuData.showCatalogTitle;
        }
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

  // Método para obtener el nombre del rol actual
  getRoleName(): string {
    if (this.currentUser && this.currentUser.idRol) {
      return this.roleService.getRoleName(this.currentUser.idRol);
    }
    return '';
  }

  // Método para verificar si el usuario actual es administrador
  isAdmin(): boolean {
    if (this.currentUser && this.currentUser.idRol) {
      return this.currentUser.idRol === '678c7655383a3ce77acb0ce3'; // ID del rol Admin
    }
    return false;
  }

  // Método para verificar si una opción de menú está permitida
  isMenuAllowed(menuOption: string): boolean {
    return this.allowedMenuOptions.includes(menuOption);
  }
}
