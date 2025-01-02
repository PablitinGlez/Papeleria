import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [ReactiveFormsModule],
})
export default class Login {
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
}
