import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any = null;
  isLoading: boolean = true;
  defaultImage: string = 'assets/images/default-avatar.png';
  private userSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private roleService: RoleService,
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    // Limpiamos la suscripción cuando el componente se destruye
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadUserProfile(): void {
    this.isLoading = true;

    // Intentamos obtener el usuario actual si ya está disponible
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
      console.log('Usuario cargado:', this.user);
      this.isLoading = false;
    } else {
      // Nos suscribimos al observable por si el usuario aún no está cargado
      this.userSubscription = this.authService.currentUser$.subscribe({
        next: (userData) => {
          this.user = userData;
          console.log('Usuario cargado desde observable:', this.user);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar el usuario:', error);
          this.isLoading = false;
        },
      });
    }
  }

  // Método para determinar si hay una URL de imagen válida
  getProfileImage(): string {
    // Verificar primero photoURL (para autenticación con Google)
    if (this.user?.photoURL) {
      return this.user.photoURL;
    }
    // Luego verificar imagen de perfil para registro normal
    else if (this.user?.imageUrl) {
      return this.user.imageUrl;
    }
    // Finalmente, usar imagen por defecto
    else {
      return this.defaultImage;
    }
  }

  // Método para manejar errores de carga de imagen
  handleImageError(event: any): void {
    event.target.src = this.defaultImage;
  }

  // Método para obtener el nombre del usuario
  getUserName(): string {
    // Verificar primero displayName (para autenticación con Google)
    if (this.user?.displayName) {
      return this.user.displayName;
    }
    // Luego verificar nombre para registro normal
    else if (this.user?.nombre) {
      return this.user.nombre;
    }
    // Finalmente, usar el correo si nada más está disponible
    else {
      return this.user?.correo || this.user?.email || 'Usuario';
    }
  }

  // Método para obtener el correo del usuario
  getUserEmail(): string {
    return this.user?.correo || this.user?.email || 'Correo no disponible';
  }

  // Método para obtener el rol del usuario usando el servicio de roles
  getUserRole(): string {
    if (this.user?.idRol) {
      return this.roleService.getRoleName(this.user.idRol);
    }
    // Si hay un objeto de rol anidado con nombre
    else if (this.user?.rol?.nombre) {
      return this.user.rol.nombre;
    }
    // Valor por defecto
    return 'Usuario';
  }

  // Método para obtener el estado del usuario
  getUserStatus(): string {
    if (this.user?.estado === true || this.user?.estado === 'Activo') {
      return 'Activo';
    } else if (
      this.user?.estado === false ||
      this.user?.estado === 'Inactivo'
    ) {
      return 'Inactivo';
    }
    return this.user?.estado || 'Desconocido';
  }

  // Método para determinar si el usuario es administrador
  isAdmin(): boolean {
    if (this.user?.idRol) {
      return this.user.idRol === '678c7655383a3ce77acb0ce3'; // ID del rol Admin
    }
    return false;
  }
}
