import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../app/enviroments/environment';

export interface Categoria {
  _id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriasService {
  constructor(private http: HttpClient) {}

  getCategorias(): Observable<Categoria[]> {
    return this.http
      .get<Categoria[]>(`${environment.api.productosApis}/categorias`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener categorías:', error);
          return throwError(() => error);
        }),
      );
  }

  getCategoriaById(id: string): Observable<Categoria> {
    return this.http
      .get<Categoria>(`${environment.api.productosApis}/categorias/${id}`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener categoría:', error);
          return throwError(() => error);
        }),
      );
  }

  createCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http
      .post<Categoria>(`${environment.api.productosApis}/categorias`, categoria)
      .pipe(
        catchError((error) => {
          console.error('Error al crear categoría:', error);
          return throwError(() => error);
        }),
      );
  }

  updateCategoria(id: string, categoria: Categoria): Observable<Categoria> {
    return this.http
      .put<Categoria>(
        `${environment.api.productosApis}/categorias/${id}`,
        categoria,
      )
      .pipe(
        catchError((error) => {
          console.error('Error al actualizar categoría:', error);
          return throwError(() => error);
        }),
      );
  }

  deleteCategoria(id: string): Observable<any> {
    return this.http
      .delete(`${environment.api.productosApis}/categorias/${id}`)
      .pipe(
        catchError((error) => {
          console.error('Error al eliminar categoría:', error);
          return throwError(() => error);
        }),
      );
  }

  getPaginatedCategorias(
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
      .get<any>(`${environment.api.productosApis}/categorias/paginated`, {
        params,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener categorías paginadas:', error);
          return throwError(() => error);
        }),
      );
  }

  getDashboardStats(): Observable<any> {
    return this.http
      .get<any>(`${environment.api.productosApis}/categorias/dashboard/stats`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener estadísticas del dashboard:', error);
          return throwError(() => error);
        }),
      );
  }
}
