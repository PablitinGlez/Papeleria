import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BtnGoogleComponent } from '@components/btn-google/btn-google.component';
import { ButtonBlueComponent } from '@components/button-blue/button-blue.component';
import { SignupHeaderComponent } from '@components/signup-header/signup-header.component';
import { AuthenticationApiServiceService } from '../../data-access/authentication-api-service.service';

@Component({
  selector: 'app-sign-up',
  standalone: true, // Asegúrate de que el componente sea standalone
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

  constructor(
    private authService: AuthenticationApiServiceService,
    private router: Router,
  ) {}

  register() {
    if (this.password === this.confirmPassword) {
      this.authService
        .signup(
          this.name,
          this.email,
          this.phone,
          this.birthdate,
          this.password,
        )
        .subscribe({
          next: (response) => {
            console.log('Registro exitoso:', response);
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            console.error('Error al registrar:', error);
          },
        });
    } else {
      console.log('Las contraseñas no coinciden');
    }
  }
}
