import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriasService } from '../../auth/data-access/categories.service';
import { ProductosService } from '../../auth/data-access/productos.service';

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
  idCategoria: {
    _id: string;
    nombre: string;
  };
  stock: number;
  rating: number;
  estado: string;
  imageUrl: string;
}

@Component({
  selector: 'app-productos-categoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos-categoria.component.html',
  styleUrls: ['./productos-categoria.component.css'],
})
export class ProductosCategoriaComponent implements OnInit {
  productos: Producto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  categoriaNombre: string = '';
  categoriaId: string = '';

  // Paginación
  currentPage: number = 0;
  pageSize: number = 12;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosService: ProductosService,
    private categoriasService: CategoriasService,
  ) {
    // Intentar obtener la categoría del estado de la navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as { categoria: any };
      if (state.categoria) {
        this.categoriaNombre = state.categoria.nombre;
        this.categoriaId = state.categoria._id;
      }
    }
  }

  ngOnInit(): void {
    // Si no tenemos la categoría del estado, obtenemos el ID de la URL
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.categoriaId = id;

        // Si no tenemos el nombre de la categoría, lo buscamos
        if (!this.categoriaNombre) {
          this.loadCategoriaInfo(id);
        } else {
          // Ya tenemos toda la info, cargamos los productos
          this.loadProductos();
        }
      } else {
        this.error = 'ID de categoría no proporcionado';
        this.isLoading = false;
      }
    });
  }

  loadCategoriaInfo(id: string): void {
    this.categoriasService.getCategoriaById(id).subscribe({
      next: (categoria) => {
        this.categoriaNombre = categoria.nombre;
        this.loadProductos();
      },
      error: (err) => {
        this.error = 'Error al cargar información de la categoría';
        this.isLoading = false;
        console.error('Error al cargar categoría:', err);
      },
    });
  }

  loadProductos(): void {
    this.isLoading = true;
    this.productosService
      .getProductosByCategoria(
        this.categoriaId,
        this.currentPage,
        this.pageSize,
      )
      .subscribe({
        next: (response) => {
          this.productos = response.items;
          this.totalItems = response.meta.total;
          this.totalPages = response.meta.totalPages;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar los productos';
          this.isLoading = false;
          console.error('Error al cargar productos por categoría:', err);
        },
      });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadProductos();
    }
  }

  // Método para volver a la página de categorías
  volverCategorias(): void {
    this.router.navigate(['/categories']);
  }

  verDetalleProducto(productoId: string): void {
    this.router.navigate(['/producto-detail', productoId]);
  }
}
