import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BtnGoogleComponent } from '@components/btn-google/btn-google.component';
import { ButtonBlueComponent } from '../../../components/button-blue/button-blue.component';
import { SignupHeaderComponent } from '../../../components/signup-header/signup-header.component';
import { AuthService } from '../../data-access/auth.service';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SignupHeaderComponent,
    RouterLink,
    RouterLinkActive,
    BtnGoogleComponent,
    ButtonBlueComponent,
    
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent {
  isDarkTheme = false;

  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);

  form = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(private themeService: ThemeService) {}

  login() {
    if (!this.form.valid) return;

    const { email, password } = this.form.value;
    if (email && password) {
      this._authService.login(email, password).subscribe({
        next: () => {
          console.log('Login exitoso');
        },
        error: (error) => {
          console.error('Error en el login:', error);
        },
      });
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeService.setTheme(this.isDarkTheme);
  }

  navigateToRegister(): void {
    console.log('Navegación a registro');
  }
}
