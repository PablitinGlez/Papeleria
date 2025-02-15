import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  UserCredential
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { environment } from 'src/app/enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router = inject(Router);
  private _currentUser = new BehaviorSubject<any>(this.decodeToken());
  private _isAuthenticating = new BehaviorSubject<boolean>(false);

  currentUser$ = this._currentUser.asObservable();
  isAuthenticating$ = this._isAuthenticating.asObservable();

  constructor(private http: HttpClient) {}

  // Añadimos el método signup
  signup(
    nombre: string,
    correo: string,
    telefono: string,
    fechaNacimiento: string,
    password: string,
  ): Observable<any> {
    const signupData = {
      nombre,
      correo,
      password,
      telefono,
      fechaNacimiento,
    };

    return this.http
      .post(`${environment.api.authApis}/auth/sign-up`, signupData)
      .pipe(
        tap((response: any) => {
          if (response.token) {
            this.saveToken({
              token: response.token,
              user: response.usuario,
            });
            this._currentUser.next(response.usuario);
            this.router.navigate(['/dashboard']); // Redirigir al dashboard después del registro
          }
          console.log('Registro exitoso', response);
        }),
        catchError((error) => {
          console.error('Error en el registro:', error);
          return throwError(() => error);
        }),
      );
  }

  login(email: string, password: string): Observable<any> {
    const loginData = {
      correo: email, // Cambiamos el nombre del campo para que coincida con el backend
      password: password,
    }; // Cambia el nombre del campo a 'correo'
    return this.http
      .post(`${environment.api.authApis}/auth/login`, loginData) // Añade '/auth' al endpoint
      .pipe(
        tap((response) => {
          console.log('Login exitoso', response);
          this.router.navigate(['/dashboard']);
        }),
        catchError((error) => {
          console.error('Error en el inicio de sesión:', error);
          return throwError(() => error);
        }),
      );
  }

  signInWithGoogle(): Observable<UserCredential> {
    if (this._isAuthenticating.value) {
      console.log('Ya hay un proceso de autenticación en curso');
      return throwError(() => new Error('Authentication in progress'));
    }

    this._isAuthenticating.next(true);
    console.log('Iniciando autenticación con Google');

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    return from(signInWithPopup(this.auth, provider)).pipe(
      tap((credentials: UserCredential) => {
        console.log('Autenticación exitosa', credentials);

        const user = {
          uid: credentials.user.uid,
          email: credentials.user.email,
          displayName: credentials.user.displayName,
          photoURL: credentials.user.photoURL,
        };

        // Almacenar token y actualizar el estado
        this.saveToken(user);
        this._currentUser.next(user);

        console.log('Usuario autenticado', user);

        // Redirigir al dashboard
        this.router.navigateByUrl('/dashboard');
        console.log('Redirigiendo al dashboard');
      }),
      catchError((error) => {
        console.error('Error durante el inicio de sesión con Google:', error);
        return throwError(() => error);
      }),
      finalize(() => {
        console.log('Finalizando proceso de autenticación');
        this._isAuthenticating.next(false);
      }),
    );
  }
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        localStorage.removeItem('userData');
        this._currentUser.next(null);
        this.router.navigateByUrl('/auth/login');
      }),
      catchError((error) => {
        console.error('Error durante logout:', error);
        return throwError(() => error);
      }),
    );
  }

  private saveToken(user: any) {
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private decodeToken() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
}
