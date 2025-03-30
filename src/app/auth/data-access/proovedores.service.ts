import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../enviroments/environment';

// Definición de la interfaz Proveedor
export interface Proveedor {
  _id: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  rfc: string;
  contactoPrincipal: string;
  tipoProveedor: 'nacional' | 'internacional';
  categoriaProductos: {
    _id: string;
    nombre: string;
    descripcion: string;
  }[];
  estado: 'activo' | 'inactivo';
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProveedoresService {
  constructor(private http: HttpClient) {}

  // URL base para las peticiones a la API
  private apiUrl = `${environment.api.productosApis}/proveedores`;

  // Obtener todos los proveedores
  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}`).pipe(
      catchError((error) => {
        console.error('Error al obtener proveedores:', error);
        return throwError(() => error);
      }),
    );
  }

  // Obtener un proveedor por ID
  getProveedorById(id: string): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error al obtener proveedor:', error);
        return throwError(() => error);
      }),
    );
  }

  // Crear un nuevo proveedor
  createProveedor(
    proveedor: Omit<Proveedor, '_id' | 'createdAt' | 'updatedAt'>,
  ): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.apiUrl}`, proveedor).pipe(
      tap((response) => console.log('Proveedor creado:', response)),
      catchError((error) => {
        console.error('Error al crear proveedor:', error);
        return throwError(() => error);
      }),
    );
  }

  // Actualizar un proveedor existente
  updateProveedor(
    id: string,
    proveedor: Partial<Proveedor>,
  ): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, proveedor).pipe(
      tap((response) => console.log('Proveedor actualizado:', response)),
      catchError((error) => {
        console.error('Error al actualizar proveedor:', error);
        return throwError(() => error);
      }),
    );
  }

  // Eliminar un proveedor
  deleteProveedor(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap((response) => console.log('Proveedor eliminado:', response)),
      catchError((error) => {
        console.error('Error al eliminar proveedor:', error);
        return throwError(() => error);
      }),
    );
  }

  // Cambiar el estado de un proveedor (activo/inactivo)
  changeProveedorStatus(
    id: string,
    estado: 'activo' | 'inactivo',
  ): Observable<Proveedor> {
    return this.http
      .patch<Proveedor>(`${this.apiUrl}/${id}/status`, { estado })
      .pipe(
        tap((response) =>
          console.log('Estado del proveedor actualizado:', response),
        ),
        catchError((error) => {
          console.error('Error al cambiar el estado del proveedor:', error);
          return throwError(() => error);
        }),
      );
  }

  // Buscar proveedores por distintos campos
  searchProveedores(query: string): Observable<Proveedor[]> {
    return this.http
      .get<Proveedor[]>(`${this.apiUrl}/search`, {
        params: { q: query },
      })
      .pipe(
        catchError((error) => {
          console.error('Error al buscar proveedores:', error);
          return throwError(() => error);
        }),
      );
  }

  // Obtener proveedores por categoría
  getProveedoresByCategoria(categoriaId: string): Observable<Proveedor[]> {
    return this.http
      .get<Proveedor[]>(`${this.apiUrl}/categoria/${categoriaId}`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener proveedores por categoría:', error);
          return throwError(() => error);
        }),
      );
  }

  // Obtener proveedores paginados con filtros
  getPaginatedProveedores(
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

    // Agregar filtros opcionales
    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.tipoProveedor)
      params = params.set('tipoProveedor', filters.tipoProveedor);
    if (filters.q) params = params.set('q', filters.q);
    if (filters.categoriaProductos)
      params = params.set('categoriaProductos', filters.categoriaProductos);

    return this.http.get<any>(`${this.apiUrl}/paginated`, { params }).pipe(
      catchError((error) => {
        console.error('Error al obtener proveedores paginados:', error);
        return throwError(() => error);
      }),
    );
  }

  // Obtener estadísticas del dashboard de proveedores
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/stats`).pipe(
      catchError((error) => {
        console.error('Error al obtener estadísticas de proveedores:', error);
        return throwError(() => error);
      }),
    );
  }

  // Obtener todas las categorías (para usar en formularios de proveedores)
  getCategorias(): Observable<any[]> {
    return this.http
      .get<any[]>(`${environment.api.productosApis}/categorias`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener categorías:', error);
          return throwError(() => error);
        }),
      );
  }
}
