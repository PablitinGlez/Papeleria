import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BtnGoogleComponent } from '@components/btn-google/btn-google.component';
import { ButtonBlueComponent } from '@components/button-blue/button-blue.component';
import { SignupHeaderComponent } from '@components/signup-header/signup-header.component';
import { AuthService } from '../../data-access/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    SignupHeaderComponent,
    BtnGoogleComponent,
    ButtonBlueComponent,
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './sign-up.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  name: string = '';
  email: string = '';
  phone: string = '';
  birthdate: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  // Mensaje de error general para formulario vacío
  generalError: string = '';

  // Mensajes de error para cada campo
  nameError: string = '';
  emailError: string = '';
  phoneError: string = '';
  birthdateError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';

  // Estado de validación para los criterios de la contraseña
  passwordLengthValid: boolean = false;
  passwordNumberValid: boolean = false;
  passwordSpecialCharValid: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  changeInputType(type: string) {
    const inputElement = document.getElementById(
      'fechaNacimiento',
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.type = type;
      if (type === 'text' && !this.birthdate) {
        inputElement.placeholder = 'Fecha de Nacimiento';
      }
    }
  }

  // Validar criterios de contraseña en tiempo real
  checkPasswordCriteria() {
    // Valida longitud entre 6 y 15 caracteres
    this.passwordLengthValid =
      this.password.length >= 6 && this.password.length <= 15;

    // Valida si contiene al menos un número
    this.passwordNumberValid = /\d/.test(this.password);

    // Valida si contiene al menos un carácter especial
    this.passwordSpecialCharValid = /[@$!%*?&]/.test(this.password);
  }

  validateForm(): boolean {
    let isValid = true;

    // Verificar si todos los campos están vacíos
    if (
      !this.name &&
      !this.email &&
      !this.phone &&
      !this.birthdate &&
      !this.password &&
      !this.confirmPassword
    ) {
      this.generalError = 'Todos los campos son obligatorios';
      // Limpiar errores individuales
      this.nameError = '';
      this.emailError = '';
      this.phoneError = '';
      this.birthdateError = '';
      this.passwordError = '';
      this.confirmPasswordError = '';
      return false;
    } else {
      // Limpiar mensaje de error general
      this.generalError = '';
    }

    // Validar nombre
    if (!this.name) {
      this.nameError = 'El nombre es obligatorio';
      isValid = false;
    } else if (!/^[A-Za-z\s]{8,15}$/.test(this.name)) {
      this.nameError = 'Debe contener mínimo 8 caracteres y solo letras';
      isValid = false;
    } else {
      this.nameError = '';
    }

    // Validar email
    if (!this.email) {
      this.emailError = 'El email es obligatorio';
      isValid = false;
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email)
    ) {
      this.emailError = 'El email no tiene un formato válido';
      isValid = false;
    } else {
      this.emailError = '';
    }

    // Validar teléfono
    if (!this.phone) {
      this.phoneError = 'El teléfono es obligatorio';
      isValid = false;
    } else if (!/^\d{10}$/.test(this.phone)) {
      this.phoneError = 'El teléfono debe tener 10 dígitos';
      isValid = false;
    } else {
      this.phoneError = '';
    }

    // Validar fecha de nacimiento
    if (!this.birthdate) {
      this.birthdateError = 'La fecha de nacimiento es obligatoria';
      isValid = false;
    } else {
      this.birthdateError = '';
    }

    // Validar contraseña
    if (!this.password) {
      this.passwordError = 'La contraseña es obligatoria';
      isValid = false;
    } else if (
      !this.passwordLengthValid ||
      !this.passwordNumberValid ||
      !this.passwordSpecialCharValid
    ) {
      this.passwordError = 'La contraseña no cumple con todos los requisitos';
      isValid = false;
    } else {
      this.passwordError = '';
    }

    // Validar confirmación de contraseña
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Debes confirmar la contraseña';
      isValid = false;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Las contraseñas no coinciden';
      isValid = false;
    } else {
      this.confirmPasswordError = '';
    }

    return isValid;
  }

  register() {
    if (!this.validateForm()) {
      if (this.errorMessage) {
        // Mostrar el mensaje de error general
        alert(this.errorMessage);
      }
      return;
    }

    // Formatear la fecha correctamente
    const formattedDate = new Date(this.birthdate).toISOString().split('T')[0];

    // Mapeo de campos frontend -> backend
    const signupData = {
      nombre: this.name,
      correo: this.email,
      telefono: this.phone,
      fechaNacimiento: formattedDate,
      password: this.password,
    };

    this.authService
      .signup(
        signupData.nombre,
        signupData.correo,
        signupData.telefono,
        signupData.fechaNacimiento,
        signupData.password,
      )
      .subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          this.errorMessage =
            error.error?.message || 'Error al registrar usuario';
        },
      });
  }

  onNameKeyDown(event: KeyboardEvent) {
    const allowedKeys = /^[a-zA-Z\s]$/;
    const specialKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];

    if (!allowedKeys.test(event.key) && !specialKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  onPhoneKeyDown(event: KeyboardEvent) {
    const allowedKeys = /^[0-9]$/;
    const specialKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];

    if (!allowedKeys.test(event.key) && !specialKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
}

