import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../enviroments/environment'; // Ajusta la ruta si es necesario

interface Producto {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioDescuento: number;
  idMarca: {
    _id: string;
    nombre: string;
  };
  stock: number;
  rating: number;
  estado: string;
  imageUrl: string;
  cloudinary_id: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getProductos(): Observable<Producto[]> {
    return this.http
      .get<Producto[]>(`${environment.api.productosApis}/productos`)
      .pipe(
        map((productos) =>
          productos.map((producto) => ({
            ...producto,
            marca: producto.idMarca?.nombre || 'Sin marca',
          })),
        ),
        catchError((error) => {
          console.error('Error al obtener productos:', error);
          return throwError(() => error);
        }),
      );
  }

  // Obtener un producto por ID
  getProductoById(id: string): Observable<Producto> {
    return this.http
      .get<Producto>(`${environment.api.productosApis}/productos/${id}`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener producto:', error);
          return throwError(() => error);
        }),
      );
  }

  // Crear un nuevo producto
  createProducto(formData: FormData): Observable<any> {
    return this.http
      .post(`${environment.api.productosApis}/productos`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error al crear producto:', error);
          return throwError(() => error);
        }),
      );
  }

  // Actualizar un producto
  // Actualizar un producto existente
  updateProducto(id: string, formData: FormData): Observable<any> {
    // Log para depuración
    console.log('Actualizando producto ID:', id);
    console.log('FormData keys:', Array.from(formData.keys()));
    console.log('deleteImage flag:', formData.get('deleteImage'));

    return this.http
      .put(`${environment.api.productosApis}/productos/${id}`, formData)
      .pipe(
        tap((response) => console.log('Producto actualizado:', response)),
        catchError((error) => {
          console.error('Error al actualizar producto:', error);
          return throwError(() => error);
        }),
      );
  }

  // Eliminar un producto
  deleteProducto(id: string): Observable<any> {
    return this.http
      .delete(`${environment.api.productosApis}/productos/${id}`)
      .pipe(
        catchError((error) => {
          console.error('Error al eliminar producto:', error);
          return throwError(() => error);
        }),
      );
  }

  // Buscar productos por nombre o descripción
  searchProductos(query: string): Observable<Producto[]> {
    return this.http
      .get<Producto[]>(`${environment.api.productosApis}/productos/search`, {
        params: { q: query },
      })
      .pipe(
        catchError((error) => {
          console.error('Error al buscar productos:', error);
          return throwError(() => error);
        }),
      );
  }

  // Obtener productos paginados
  getPaginatedProductos(
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
    if (filters.idMarca) params = params.set('idMarca', filters.idMarca);
    if (filters.q) params = params.set('q', filters.q);

    return this.http
      .get<any>(`${environment.api.productosApis}/productos/paginated`, {
        params,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener productos paginados:', error);
          return throwError(() => error);
        }),
      );
  }

  // Obtener estadísticas del dashboard
  getDashboardStats(): Observable<any> {
    return this.http
      .get<any>(`${environment.api.productosApis}/productos/dashboard/stats`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener estadísticas del dashboard:', error);
          return throwError(() => error);
        }),
      );
  }

  // En productos.service.ts
  getMarcas(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api.productosApis}/marcas`).pipe(
      catchError((error) => {
        console.error('Error al obtener marcas:', error);
        return throwError(() => error);
      }),
    );
  }

  // product.service.ts
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

  getProductosDestacados(limit: number = 4): Observable<Producto[]> {
    return this.http
      .get<any>(`${environment.api.productosApis}/productos/paginated`, {
        params: new HttpParams()
          .set('page', '0')
          .set('limit', limit.toString())
          .set('sortField', 'rating')
          .set('sortOrder', 'desc')
          .set('estado', 'activo'),
      })
      .pipe(
        map((response) => response.items),
        catchError((error) => {
          console.error('Error al obtener productos destacados:', error);
          return throwError(() => error);
        }),
      );
  }

  // En auth/data-access/productos.service.ts - añade este método
  getProductsCreatedByDayOfWeek(): Observable<any[]> {
    return this.http
      .get<any[]>(`${environment.api.productosApis}/productos/stats/by-day`)
      .pipe(
        catchError((error) => {
          console.error(
            'Error al obtener productos por día de la semana:',
            error,
          );
          return throwError(() => error);
        }),
      );
  }

  getProductosByCategoria(
    categoriaId: string,
    page: number = 0,
    limit: number = 10,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('idCategoria', categoriaId);

    return this.http
      .get<any>(`${environment.api.productosApis}/productos/paginated`, {
        params,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener productos por categoría:', error);
          return throwError(() => error);
        }),
      );
  }

  
}
