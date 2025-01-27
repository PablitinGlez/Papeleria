import { CommonModule } from '@angular/common'; // Importar CommonModule
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
    CommonModule, // Agregar CommonModule aquí
    ReactiveFormsModule,
    SignupHeaderComponent,
    RouterLink,
    RouterLinkActive,
    ButtonBlueComponent,
    BtnGoogleComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent {
  isDarkTheme = false;

  constructor(private themeService: ThemeService) {}

  _formBuilder = inject(FormBuilder);
  _authService = inject(AuthService);

  form = this._formBuilder.group({
    email: this._formBuilder.control('', Validators.required),
    password: this._formBuilder.control('', Validators.required),
  });

  login() {
    if (!this.form.valid) return;
    const email = this.form.value!.email!;
    this._authService.login(email).subscribe();
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeService.setTheme(this.isDarkTheme);
  }
  navigateToRegister(): void {
    console.log('Navegación a registro');
  }
}
