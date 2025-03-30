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

  constructor(private http: HttpClient) {
    this.initAuthState();
  }

  // Añadimos el método signup
  signup(
    nombre: string,
    correo: string,
    telefono: string,
    fechaNacimiento: string,
    password: string,
    profileImage?: File, // Add optional profile image parameter
  ): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('correo', correo);
    formData.append('telefono', telefono);
    formData.append('fechaNacimiento', fechaNacimiento);
    formData.append('password', password);

    if (profileImage) {
      formData.append('image', profileImage);
    }

    console.log('Enviando fecha al backend:', fechaNacimiento); // Log para verificación

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
      correo: email,
      password: password,
    };
    return this.http
      .post(`${environment.api.authApis}/auth/login`, loginData)
      .pipe(
        tap((response: any) => {
          console.log('Login exitoso', response);
          if (response.token) {
            this.saveToken({
              token: response.token,
              user: response.usuario,
              loginType: response.usuario.loginType, // Add this line
            });
            this._currentUser.next(response.usuario);
            this.router.navigate(['/dashboard']);
          }
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
        // Limpiar todos los datos de autenticación
        localStorage.clear(); // Limpia todo el localStorage
        sessionStorage.clear(); // Limpia todo el sessionStorage si lo usas
        this._currentUser.next(null);

        // Limpiar cualquier otro estado de la aplicación si es necesario
        // Por ejemplo, si tienes otros servicios con estado:
        // this.userPreferencesService.clear();
        // this.cartService.clear();

        // Redirigir a la página de inicio
        this.router.navigate(['/landing'], {
          replaceUrl: true, // Esto evita que el usuario pueda volver atrás
        });
      }),
      catchError((error) => {
        console.error('Error durante logout:', error);
        return throwError(() => error);
      }),
    );
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.decodeToken();
  }

  getToken(): string | null {
    const userData = this.decodeToken();
    return userData?.token || null;
  }

  private saveToken(data: any) {
    // Asegúrate de guardar una estructura consistente
    const userData = data.user || data;
    localStorage.setItem(
      'userData',
      JSON.stringify({
        token: data.token,
        user: userData,
      }),
    );

    // Actualiza el BehaviorSubject con el usuario, no con todo el objeto
    this._currentUser.next(userData);
  }

  private decodeToken() {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) return null;

      const parsedData = JSON.parse(userData);
      console.log('Datos del usuario recuperados:', parsedData);
      return parsedData?.user || parsedData; // Modificar según la estructura exacta que guardas
    } catch (error) {
      console.error('Error decodificando datos del usuario:', error);
      return null;
    }
  }

  private initAuthState() {
    const userData = this.decodeToken();
    console.log('Estado inicial de autenticación:', userData);
    if (userData) {
      this._currentUser.next(userData);
    }
  }
  // Añadir este método en auth.service.ts
  getCurrentUser(): any {
    return this._currentUser.getValue();
  }
}
