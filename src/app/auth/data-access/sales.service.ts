import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../enviroments/environment';

export interface Venta {
  _id: string;
  usuario?: {
    _id: string;
    nombre: string;
    correo: string;
  };
  productos: Array<{
    producto: {
      _id: string;
      nombre: string;
      precio: number;
      imageUrl?: string;
    };
    cantidad: number;
    precioUnitario: number;
    subtotal?: number;
  }>;
  total: number;
  estado: string;
  metodoPago?: string;
  fechaVenta?: string;
  fechaPago?: string;
  codigoQR?: string;
  carrito?: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardVentasStats {
  totalVentas: number;
  ventasHoy: number;
  ingresosHoy: number;
  ingresosTotales: number;
  ultimasVentas: Venta[];
}

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  constructor(private http: HttpClient) {}

  // Obtener todas las ventas
  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${environment.api.ventasApis}/ventas`).pipe(
      catchError((error) => {
        console.error('Error al obtener ventas:', error);
        return throwError(() => error);
      }),
    );
  }

  // Obtener una venta por ID
  getVentaById(id: string): Observable<Venta> {
    return this.http
      .get<Venta>(`${environment.api.ventasApis}/ventas/${id}`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener venta:', error);
          return throwError(() => error);
        }),
      );
  }

  // Obtener ventas paginadas
  getPaginatedVentas(
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
    if (filters.metodoPago)
      params = params.set('metodoPago', filters.metodoPago);
    if (filters.fechaInicio)
      params = params.set('fechaInicio', filters.fechaInicio);
    if (filters.fechaFin) params = params.set('fechaFin', filters.fechaFin);
    if (filters.q) params = params.set('q', filters.q);

    return this.http
      .get<any>(`${environment.api.ventasApis}/ventas`, { params })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener ventas paginadas:', error);
          return throwError(() => error);
        }),
      );
  }

  // Obtener estadísticas de ventas
  // En sales.service.ts
  getDashboardVentasStats(): Observable<DashboardVentasStats> {
    return this.http
      .get<DashboardVentasStats>(
        `${environment.api.ventasApis}/ventas/dashboard/stats`,
      )
      .pipe(
        catchError((error) => {
          console.error('Error al obtener estadísticas de ventas:', error);
          return throwError(() => error);
        }),
      );
  }

  // Buscar ventas
  searchVentas(query: string): Observable<Venta[]> {
    return this.http
      .get<Venta[]>(`${environment.api.ventasApis}/ventas/search`, {
        params: { q: query },
      })
      .pipe(
        catchError((error) => {
          console.error('Error al buscar ventas:', error);
          return throwError(() => error);
        }),
      );
  }

  // Cambiar estado de una venta (ej: cancelar)
  cambiarEstadoVenta(id: string, estado: string): Observable<any> {
    return this.http
      .patch(`${environment.api.ventasApis}/ventas/${id}/estado`, { estado })
      .pipe(
        catchError((error) => {
          console.error('Error al cambiar estado de venta:', error);
          return throwError(() => error);
        }),
      );
  }
  eliminarVenta(id: string): Observable<any> {
    return this.http.delete(`${environment.api.ventasApis}/ventas/${id}`).pipe(
      catchError((error) => {
        console.error('Error al eliminar venta:', error);
        return throwError(() => error);
      }),
    );
  }

    // Añadir al sales.service.ts
getTopClientes(limit: number = 1): Observable<any[]> {
  return this.http
    .get<any[]>(
      `${environment.api.ventasApis}/ventas/dashboard/clientes-top?limit=${limit}`
    )
    .pipe(
      catchError((error) => {
        console.error('Error al obtener clientes con más ventas:', error);
        return throwError(() => error);
      }),
    );
}
    
}
