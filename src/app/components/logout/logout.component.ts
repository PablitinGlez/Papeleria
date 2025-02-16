// logout.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../auth/data-access/auth.service';

@Component({
  selector: 'app-logout-button',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutButtonComponent {
  isLoggingOut = false;

  constructor(private authService: AuthService) {}

  handleLogout(): void {
    this.isLoggingOut = true;

    this.authService.logout().subscribe({
      next: () => {
        // La redirección ya está manejada en el AuthService
        console.log('Sesión cerrada exitosamente');
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        this.isLoggingOut = false;
      },
    });
  }
}
