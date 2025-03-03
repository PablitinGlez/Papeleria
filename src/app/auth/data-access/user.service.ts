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
import { catchError, map } from 'rxjs/operators';
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
}
 