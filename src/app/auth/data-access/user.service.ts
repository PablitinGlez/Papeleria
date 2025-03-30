import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  getDocs,
  query,
  setDoc,
  where
} from '@angular/fire/firestore';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../enviroments/environment'; // Ajusta esta ruta si es necesario

interface Usuario {
  _id: string;
  nombre: string;
  correo: string;
  fechaNacimiento: Date;
  idRol: {
   _id: string;
  nombre: string;
  descripcion: string;
  };
  estado: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
}


@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private firestore: Firestore,
    private http: HttpClient,
  ) {}

  async checkIfUserExists(email: string): Promise<boolean> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // Crear documento de usuario en Firestore
  createUserDocument(user: {
    uid: string;
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
  }): Observable<void> {
    const userDocRef = doc(this.firestore, 'users', user.uid);

    return from(
      setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date(),
      }).then(() => {
        console.log('Usuario creado en Firestore');
      }),
    ).pipe(
      catchError((error) => {
        console.error('Error al crear usuario en Firestore:', error);
        return throwError(() => error);
      }),
    );
  }

  getUsers(): Observable<Usuario[]> {
    return this.http
      .get<Usuario[]>(`${environment.api.authApis}/usuarios`)
      .pipe(
        map((users) =>
          users.map((user) => ({
            ...user,
            // Asegurarse de que el rol esté accesible correctamente
            rol: user.idRol?.nombre || 'No asignado',
          })),
        ),
        catchError((error) => {
          console.error('Error al obtener usuarios:', error);
          return throwError(() => error);
        }),
      );
  }

  deleteUser(userId: string): Observable<any> {
    return this.http
      .delete(`${environment.api.authApis}/usuarios/${userId}`)
      .pipe(
        catchError((error) => {
          console.error('Error al eliminar usuario:', error);
          return throwError(() => error);
        }),
      );
  }

  // Agregar este método en tu UserService

  createUser(formData: FormData): Observable<any> {
    // Log para debugging
    console.log('FormData a enviar:', Array.from(formData.entries()));

    return this.http
      .post(`${environment.api.authApis}/usuarios`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error en createUser:', error);
          return throwError(() => error);
        }),
      );
  }

  // En user.service.ts
  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api.authApis}/roles`).pipe(
      catchError((error) => {
        console.error('Error al obtener roles:', error);
        return throwError(() => error);
      }),
    );
  }

  // En user.service.ts
  getPaginatedUsers(
    page: number = 0,
    limit: number = 10,
    sortField: string = 'createdAt',
    sortOrder: string = 'desc',
    filters: any = {},
  ): Observable<any> {
    // Construir parámetros de consulta
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortField', sortField)
      .set('sortOrder', sortOrder);

    // Añadir filtros opcionales a los parámetros
    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.idRol) params = params.set('idRol', filters.idRol);
    if (filters.q) params = params.set('q', filters.q);

    return this.http
      .get<any>(`${environment.api.authApis}/usuarios/paginated`, { params })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener usuarios paginados:', error);
          return throwError(() => error);
        }),
      );
  }

  // En user.service.ts
  getDashboardStats(): Observable<any> {
    return this.http
      .get<any>(`${environment.api.authApis}/usuarios/dashboard/stats`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener estadísticas del dashboard:', error);
          return throwError(() => error);
        }),
      );
  }

  updateUserData(
    userId: string,
    userData: any,
    file?: File | null,
    deleteImage: boolean = false,
  ): Observable<any> {
    // Create FormData object for multipart/form-data
    const formData = new FormData();

    // Add all userData fields to the FormData
    Object.keys(userData).forEach((key) => {
      formData.append(key, userData[key]);
    });

    // If we want to delete the image, add the flag
    // This must be set BEFORE adding a new file
    if (deleteImage) {
      formData.append('deleteImage', 'true');
      console.log('Delete image flag set to true');
    } else {
      formData.append('deleteImage', 'false');
    }

    // If we have a file, add it
    if (file) {
      formData.append('image', file);
      console.log('Image file added to form data');
    }

    // Log the form data keys for debugging
    console.log('Form data keys:', Array.from(formData.keys()));

    return this.http
      .put(`${environment.api.authApis}/usuarios/${userId}`, formData)
      .pipe(
        tap((response) => console.log('Update response:', response)),
        catchError((error) => {
          console.error('Error al actualizar usuario:', error);
          return throwError(() => error);
        }),
      );
  }

  // En user.service.ts
  getUsersCreatedByDayOfWeek(): Observable<any[]> {
    return this.http
      .get<any[]>(`${environment.api.authApis}/usuarios/stats/by-day`)
      .pipe(
        catchError((error) => {
          console.error(
            'Error al obtener usuarios por día de la semana:',
            error,
          );
          return throwError(() => error);
        }),
      );
  }

  // Añadir este método al UserService
  getAdministradores(): Observable<Usuario[]> {
    return this.http
      .get<Usuario[]>(`${environment.api.authApis}/usuarios`)
      .pipe(
        map((users) =>
          users.filter((user) => user.idRol?.nombre === 'Administrador'),
        ),
        catchError((error) => {
          console.error('Error al obtener administradores:', error);
          return throwError(() => error);
        }),
      );
  }
}
 