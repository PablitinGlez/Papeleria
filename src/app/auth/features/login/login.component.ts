import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BtnGoogleComponent } from '@components/btn-google/btn-google.component';

import { ButtonBlueComponent } from '../../../components/button-blue/button-blue.component';
import { SignupHeaderComponent } from '../../../components/signup-header/signup-header.component';
import { AuthService } from '../../data-access/auth.service';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    SignupHeaderComponent,
    BtnGoogleComponent,
    ButtonBlueComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent {
  isDarkTheme = false;

  // Inicialización de FormGroup para el formulario de login
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  form: FormGroup = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]], // <- aquí dice 'email'
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  // Variable para mostrar errores
  errorMessage = '';

  constructor(private themeService: ThemeService) {}

  // Método para manejar el login
  login() {
    if (this.form.invalid) {
      this.errorMessage = 'Por favor complete todos los campos correctamente';
      return;
    }

    const { email, password } = this.form.value; // Cambiamos correo por email

    this._authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        this._router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en el login:', error);
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage =
            'Error al iniciar sesión. Por favor intente nuevamente.';
        }
      },
    });
  }

  // Método para alternar entre temas (modo oscuro)
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeService.setTheme(this.isDarkTheme);
  }

  // Navegar a la página de registro
  navigateToRegister(): void {
    this._router.navigate(['/auth/sign-up']);
  }
}
