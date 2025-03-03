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

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  register() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (
      !this.name ||
      !this.email ||
      !this.phone ||
      !this.birthdate ||
      !this.password
    ) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    // Validar que la fecha no esté vacía
    if (!this.birthdate) {
      this.errorMessage = 'La fecha de nacimiento es obligatoria';
      return;
    }

    // Formatear la fecha correctamente (opcional, pero recomendado)
    const formattedDate = new Date(this.birthdate).toISOString().split('T')[0];
    console.log('Fecha formateada:', formattedDate);

    // Mapeo de campos frontend -> backend
    const signupData = {
      nombre: this.name,
      correo: this.email,
      telefono: this.phone,
      fechaNacimiento: formattedDate, // Usa la fecha formateada
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
}
