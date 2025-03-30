import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AlertLoginComponent } from '@components/alert-login/alert-login.component';
import { BtnGoogleComponent } from '@components/btn-google/btn-google.component';
import { ButtonBlueComponent } from '../../../components/button-blue/button-blue.component';
import { SignupHeaderComponent } from '../../../components/signup-header/signup-header.component';
import { AuthService } from '../../data-access/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    SignupHeaderComponent,
    BtnGoogleComponent,
    ButtonBlueComponent,
    ReactiveFormsModule,
    RouterLink,
    AlertLoginComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent {
  form: FormGroup;
  showPassword = false;
  errorMessage = '';
  showAlert = false;
  alertMessage = '';
  formSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Método para mostrar/ocultar la contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Método para obtener mensajes de error
  getErrorMessage(controlName: string) {
    if (!this.formSubmitted) return '';

    const control = this.form.get(controlName);

    if (controlName === 'email') {
      if (control?.hasError('required')) {
        return 'El correo electrónico es obligatorio';
      }
      if (control?.hasError('email')) {
        return 'Ingrese un correo electrónico válido';
      }
    }

    if (controlName === 'password') {
      if (control?.hasError('required')) {
        return 'La contraseña es obligatoria';
      }
     
    }

    return '';
  }

  // Método para verificar si se debe mostrar un error específico
  shouldShowError(controlName: string): boolean {
    if (!this.formSubmitted) return false;

    const email = this.form.get('email');
    const password = this.form.get('password');

    // Si ambos campos están vacíos, no mostrar errores individuales
    if (
      (!email?.value || email.value.trim() === '') &&
      (!password?.value || password.value.trim() === '')
    ) {
      return false;
    }

    // Mostrar error de email solo si password tiene valor
    if (controlName === 'email' && password?.value && email?.invalid) {
      return true;
    }

    // Mostrar error de password solo si email tiene valor
    if (controlName === 'password' && email?.value && password?.invalid) {
      return true;
    }

    // Si solo un campo tiene error, mostrar ese error
    if (controlName === 'email' && email?.invalid && !password?.value) {
      return true;
    }

    if (controlName === 'password' && password?.invalid && !email?.value) {
      return true;
    }

    return false;
  }

  // Método para determinar si mostrar el mensaje general
  shouldShowGeneralError(): boolean {
    if (!this.formSubmitted) return false;

    const email = this.form.get('email');
    const password = this.form.get('password');

    // Mostrar el error general solo si ambos campos están vacíos
    return (
      (!email?.value || email.value.trim() === '') &&
      (!password?.value || password.value.trim() === '')
    );
  }

  // Método para manejar el login
  login() {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      // Verificar si ambos campos están vacíos para mostrar mensaje general
      const email = this.form.get('email');
      const password = this.form.get('password');

      if (
        (!email?.value || email.value.trim() === '') &&
        (!password?.value || password.value.trim() === '')
      ) {
        this.errorMessage = 'Todos los campos son obligatorios';
      }

      return;
    }

    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en el login:', error);

        // Mostrar alerta personalizada
        this.showAlert = true;
        this.alertMessage = 'Credenciales inválidas';

        // Opcional: ocultar la alerta después de cierto tiempo
        setTimeout(() => {
          this.showAlert = false;
        }, 5000);
      },
    });
  }

  // Método para cerrar la alerta
  closeAlert() {
    this.showAlert = false;
  }
}
