import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../enviroments/environment';

interface Empleado {
  _id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  idRol: {
    _id: string;
    nombre: string;
    descripcion: string;
  };
  puesto: string;
  telefono: string;
  salario: number;
  estado: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmpleadosService {
  constructor(private http: HttpClient) {}

  getEmpleados(): Observable<Empleado[]> {
    return this.http
      .get<Empleado[]>(`${environment.api.authApis}/empleados`)
      .pipe(
        map((empleados) =>
          empleados.map((empleado) => ({
            ...empleado,
            rol: empleado.idRol?.nombre || 'No asignado',
          })),
        ),
        catchError((error) => {
          console.error('Error al obtener empleados:', error);
          return throwError(() => error);
        }),
      );
  }

  deleteEmpleado(empleadoId: string): Observable<any> {
    return this.http
      .delete(`${environment.api.authApis}/empleados/${empleadoId}`)
      .pipe(
        catchError((error) => {
          console.error('Error al eliminar empleado:', error);
          return throwError(() => error);
        }),
      );
  }

  createEmpleado(formData: FormData): Observable<any> {
    return this.http
      .post(`${environment.api.authApis}/empleados`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error en createEmpleado:', error);
          return throwError(() => error);
        }),
      );
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api.authApis}/roles`).pipe(
      catchError((error) => {
        console.error('Error al obtener roles:', error);
        return throwError(() => error);
      }),
    );
  }

  getPaginatedEmpleados(
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
    if (filters.idRol) params = params.set('idRol', filters.idRol);
    if (filters.puesto) params = params.set('puesto', filters.puesto);
    if (filters.q) params = params.set('q', filters.q);

    return this.http
      .get<any>(`${environment.api.authApis}/empleados/paginated`, { params })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener empleados paginados:', error);
          return throwError(() => error);
        }),
      );
  }

  getDashboardStats(): Observable<any> {
    return this.http
      .get<any>(`${environment.api.authApis}/empleados/dashboard/stats`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener estadísticas del dashboard:', error);
          return throwError(() => error);
        }),
      );
  }

  updateEmpleadoData(
    empleadoId: string,
    empleadoData: any,
    file?: File | null,
    deleteImage: boolean = false,
  ): Observable<any> {
    const formData = new FormData();

    Object.keys(empleadoData).forEach((key) => {
      formData.append(key, empleadoData[key]);
    });

    if (deleteImage) {
      formData.append('deleteImage', 'true');
    } else {
      formData.append('deleteImage', 'false');
    }

    if (file) {
      formData.append('image', file);
    }

    return this.http
      .put(`${environment.api.authApis}/empleados/${empleadoId}`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error al actualizar empleado:', error);
          return throwError(() => error);
        }),
      );
  }

  getEmployeesHiredByDayOfWeek(): Observable<any[]> {
    return this.http
      .get<any[]>(`${environment.api.authApis}/empleados/stats/by-day`)
      .pipe(
        catchError((error) => {
          console.error(
            'Error al obtener empleados por día de la semana:',
            error,
          );
          return throwError(() => error);
        }),
      );
  }
}
