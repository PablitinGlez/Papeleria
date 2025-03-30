import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../enviroments/environment';

interface Marca {
  _id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  imageUrl: string;
  cloudinary_id: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalMarcas: number;
  totalMarcasActivas: number;
  ultimasMarcas: Marca[];
}

@Injectable({
  providedIn: 'root',
})
export class MarcasService {
  constructor(private http: HttpClient) {}

  // Obtener todas las marcas
  getMarcas(): Observable<Marca[]> {
    return this.http
      .get<Marca[]>(`${environment.api.productosApis}/marcas`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener marcas:', error);
          return throwError(() => error);
        }),
      );
  }

  // Obtener una marca por ID
  getMarcaById(id: string): Observable<Marca> {
    return this.http
      .get<Marca>(`${environment.api.productosApis}/marcas/${id}`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener marca:', error);
          return throwError(() => error);
        }),
      );
  }

  // Crear una nueva marca
  createMarca(formData: FormData): Observable<any> {
    return this.http
      .post(`${environment.api.productosApis}/marcas`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error al crear marca:', error);
          return throwError(() => error);
        }),
      );
  }

  // Actualizar una marca
  updateMarca(id: string, formData: FormData): Observable<any> {
    return this.http
      .put(`${environment.api.productosApis}/marcas/${id}`, formData)
      .pipe(
        tap((response) => console.log('Marca actualizada:', response)),
        catchError((error) => {
          console.error('Error al actualizar marca:', error);
          return throwError(() => error);
        }),
      );
  }

  // Eliminar una marca
  deleteMarca(id: string): Observable<any> {
    return this.http
      .delete(`${environment.api.productosApis}/marcas/${id}`)
      .pipe(
        catchError((error) => {
          console.error('Error al eliminar marca:', error);
          return throwError(() => error);
        }),
      );
  }

  // Buscar marcas por nombre
  searchMarcas(query: string): Observable<Marca[]> {
    return this.http
      .get<Marca[]>(`${environment.api.productosApis}/marcas/search`, {
        params: { q: query },
      })
      .pipe(
        catchError((error) => {
          console.error('Error al buscar marcas:', error);
          return throwError(() => error);
        }),
      );
  }

  // Obtener marcas paginadas
  getPaginatedMarcas(
    page: number = 0,
    limit: number = 10,
    sortField: string = 'createdAt',
    sortOrder: string = 'desc',
    filters: any = {},
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortField', sortField)
      .set('sortOrder', sortOrder);

    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.q) params = params.set('q', filters.q);

    return this.http
      .get<any>(`${environment.api.productosApis}/marcas/paginated`, {
        params,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener marcas paginadas:', error);
          return throwError(() => error);
        }),
      );
  }

  // Obtener estadísticas del dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return this.http
      .get<DashboardStats>(
        `${environment.api.productosApis}/marcas/dashboard/stats`,
      )
      .pipe(
        catchError((error) => {
          console.error('Error al obtener estadísticas del dashboard:', error);
          return throwError(() => error);
        }),
      );
  }
}
