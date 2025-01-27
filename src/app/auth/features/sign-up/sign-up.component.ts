import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BtnGoogleComponent } from '@components/btn-google/btn-google.component';
import { ButtonBlueComponent } from '@components/button-blue/button-blue.component';
import { SignupHeaderComponent } from '@components/signup-header/signup-header.component';

@Component({
  selector: 'app-sign-up',
  imports: [
    SignupHeaderComponent,
    BtnGoogleComponent,
    ButtonBlueComponent,
    RouterLink,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {}
