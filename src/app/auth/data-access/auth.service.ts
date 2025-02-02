import { inject, Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

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

  login(email: string, password: string): Observable<UserCredential> {
    if (this._isAuthenticating.value) {
      return throwError(() => new Error('Authentication in progress'));
    }

    this._isAuthenticating.next(true);
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap((credentials) => {
        const user = {
          uid: credentials.user.uid,
          email: credentials.user.email,
          displayName: credentials.user.displayName,
          photoURL: credentials.user.photoURL,
        };
        this.saveToken(user);
        this._currentUser.next(user);
        this.router.navigateByUrl('/dashboard');
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return throwError(() => error);
      }),
      finalize(() => {
        this._isAuthenticating.next(false);
      }),
    );
  }

  signInWithGoogle(): Observable<UserCredential> {
    if (this._isAuthenticating.value) {
      return throwError(() => new Error('Authentication in progress'));
    }

    this._isAuthenticating.next(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    return from(signInWithPopup(this.auth, provider)).pipe(
      tap((credentials: UserCredential) => {
     
        const additionalUserInfo = (
          credentials as UserCredential & { additionalUserInfo?: any }
        ).additionalUserInfo;

        if (additionalUserInfo?.isNewUser) {
          console.log('Nuevo usuario registrado');
         
        } else {
          console.log('Usuario ya registrado');
        }

        const user = {
          uid: credentials.user.uid,
          email: credentials.user.email,
          displayName: credentials.user.displayName,
          photoURL: credentials.user.photoURL,
        };
        this.saveToken(user);
        this._currentUser.next(user);
        this.router.navigateByUrl('/dashboard'); // Redirigir al dashboard después del registro
      }),
      catchError((error) => {
        console.error('Error durante el inicio de sesión con Google:', error);
        return throwError(() => error);
      }),
      finalize(() => {
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
