import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  idCategoria?: {
    _id: string;
    nombre: string;
  };
  stock: number;
  rating: number;
  estado: string;
  imageUrl: string;
}

@Component({
  selector: 'app-producto-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto-detail.component.html',
  styleUrls: ['./producto-detail.component.css'],
})
export class ProductoDetailComponent implements OnInit {
  producto: Producto | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosService: ProductosService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadProductoDetail(id);
      } else {
        this.error = 'ID de producto no proporcionado';
        this.isLoading = false;
      }
    });
  }

  loadProductoDetail(id: string): void {
    this.isLoading = true;
    this.productosService.getProductoById(id).subscribe({
      next: (data) => {
        this.producto = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el detalle del producto';
        this.isLoading = false;
        console.error('Error al cargar detalle del producto:', err);
      },
    });
  }

  volverProductos(): void {
    // Si tenemos la categoría del producto, redirigimos a la lista de productos de esa categoría
    if (this.producto?.idCategoria?._id) {
      this.router.navigate([
        '/productos-categoria',
        this.producto.idCategoria._id,
      ]);
    } else {
      // Si no tenemos la categoría, redirigimos a la lista general de productos
      this.router.navigate(['/productos']);
    }
  }
}
