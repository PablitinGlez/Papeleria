import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { AlertDeleteComponent } from '@components/alert-delete/alert-delete.component';
import { AlertSuccessComponent } from '@components/alert-success/alert-success.component';
import { MarcaFilterDialogComponent } from '@components/marca-filter-dialog-component/marca-filter-dialog-component.component';
import { ProductoModalComponent } from '@components/product-modal/product-modal.component';
import { ProductsModalComponent } from '@components/products-update/products-update.component';
import { Chart, registerables } from 'chart.js';
import { ProductosService } from 'src/app/auth/data-access/productos.service';
import { HasPermissionDirective } from 'src/app/core/directives/has-permission.directive';
import { RoleButtonDirective } from 'src/app/core/directives/rolebutton.directive';
import { Permission } from '../../core/services/role.service';
import { MatPaginatorIntlEs } from '../users/MatPaginatorIntl.service';
// Registrar componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    MatTableModule,
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatMenuModule,
    HasPermissionDirective,
    RoleButtonDirective,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlEs }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;
  pieChartInstance: Chart | null = null;

  // Datos para el dashboard
  dashboardStats: {
    totalProductos: number;
    totalProductosActivos: number;
    ultimosProductos: any[];
    productosPorMarca: any[];
    productoMenorStock: any;
  } = {
    totalProductos: 0,
    totalProductosActivos: 0,
    ultimosProductos: [],
    productosPorMarca: [],
    productoMenorStock: null,
  };
  Permission = {
    READ: 'read' as keyof Permission,
    CREATE: 'create' as keyof Permission,
    UPDATE: 'update' as keyof Permission,
    DELETE: 'delete' as keyof Permission,
  };

  displayedColumns: string[] = [
    'imageUrl',
    'nombre',
    'descripcion',
    'precio',
    'marca',
    'stock',
    'estado',
    'categoria',
    'acciones'
  ];
  dataSource: any[] = [];
  marcas: any[] = [];
  categorias: any[] = [];
  // Propiedades para paginación
  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  loading: boolean = false;
  totalPages: number = 0;

  // Propiedades para ordenamiento
  sortField: string = 'createdAt';
  sortOrder: string = 'desc';

  // Filtros
  filters: any = {};
  showFilterMenu: boolean = false;
  activeFilters: string[] = [];
  isFiltering: boolean = false;

  constructor(
    private productosService: ProductosService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    this.loadPaginatedProductos();
    this.loadDashboardStats();
    this.loadLottiePlayerScript();
    this.obtenerMarcas(); // Cargar las marcas
    this.obtenerCategorias(); // Añadir esta línea
  }

  ngAfterViewInit(): void {
    // La gráfica se cargará cuando tengamos datos, en el método loadDashboardStats
  }

  obtenerMarcas(): void {
    this.productosService.getMarcas().subscribe({
      next: (marcas) => {
        this.marcas = marcas;
      },
      error: (error) => {
        console.error('Error al obtener marcas:', error);
      },
    });
  }

  obtenerCategorias(): void {
    this.productosService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al obtener categorías:', error);
      },
    });
  }

  // Cargar estadísticas para el dashboard
  loadDashboardStats(): void {
    this.productosService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        setTimeout(() => {
          this.initPieChart();
        }, 0);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas del dashboard', error);
        this.snackBar.open(
          'Error al cargar estadísticas. Por favor, intente nuevamente.',
          'Cerrar',
          {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar'],
          },
        );
      },
    });
  }

  // Inicializar la gráfica de pastel para marcas
  initPieChart(): void {
    if (!this.pieChart || !this.dashboardStats.productosPorMarca.length) return;

    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
    }

    const ctx = this.pieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const marcas = this.dashboardStats.productosPorMarca.map(
      (item) => item.nombre,
    );
    const cantidades = this.dashboardStats.productosPorMarca.map(
      (item) => item.cantidad,
    );

    const backgroundColors = [
      'rgba(33, 150, 243, 0.7)',
      'rgba(1, 100, 244, 0.7)',
      'rgba(0, 200, 83, 0.7)',
      'rgba(255, 167, 38, 0.7)',
      'rgba(255, 61, 61, 0.7)',
      'rgba(233, 30, 99, 0.7)',
      'rgba(156, 39, 176, 0.7)',
      'rgba(255, 214, 0, 0.7)',
    ];

    this.pieChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: marcas,
        datasets: [
          {
            data: cantidades,
            backgroundColor: backgroundColors.slice(0, marcas.length),
            borderWidth: 0.5,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
          },
        },
      },
    });
  }

  // Cargar el script DotLottie player si no está cargado
  loadLottiePlayerScript(): void {
    if (!this.document.querySelector('script[src*="dotlottie-player"]')) {
      const script = this.document.createElement('script');
      script.src =
        'https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.js';
      script.type = 'module';
      this.document.body.appendChild(script);
    }
  }

  loadPaginatedProductos(): void {
    this.loading = true;
    this.isFiltering = Object.keys(this.filters).length > 0;

    this.productosService
      .getPaginatedProductos(
        this.currentPage,
        this.pageSize,
        this.sortField,
        this.sortOrder,
        this.filters,
      )
      .subscribe({
        next: (response) => {
          this.dataSource = response.items.map((producto: any) => ({
            ...producto,
            marca: producto.idMarca?.nombre || 'Sin marca',
            categoria: producto.idCategoria?.nombre || 'Sin categoría',
            fechaCreacion: new Date(producto.createdAt),
            fechaActualizacion: new Date(producto.updatedAt),
          }));

          this.totalItems = response.meta.total;
          this.totalPages = response.meta.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar los productos', error);
          this.loading = false;
          this.snackBar.open(
            'Error al cargar productos. Por favor, intente nuevamente.',
            'Cerrar',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
              panelClass: ['error-snackbar'],
            },
          );
        },
      });
  }

  // Manejar eventos de paginación
  handlePageEvent(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPaginatedProductos();
  }

  // Aplicar filtros de búsqueda
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue) {
      this.filters.q = filterValue.trim().toLowerCase();
      this.updateActiveFilters('Texto: ' + filterValue);
    } else {
      delete this.filters.q;
      this.removeActiveFilter('Texto');
    }
    this.currentPage = 0;
    this.loadPaginatedProductos();
  }

  // Mostrar/ocultar menú de filtrado
  toggleFilterMenu(): void {
    this.showFilterMenu = !this.showFilterMenu;
  }

  // Aplicar ordenamiento y filtrado
  applyFiltering(field: string, order: string): void {
    this.sortField = field === 'fechaCreacion' ? 'createdAt' : field;
    this.sortOrder = order;

    let filterText = '';

    switch (field) {
      case 'nombre':
        filterText = `Nombre: ${order === 'asc' ? 'A-Z' : 'Z-A'}`;
        break;
      case 'fechaCreacion':
        filterText = `Fecha: ${order === 'asc' ? 'Antiguos primero' : 'Recientes primero'}`;
        break;
    }

    if (filterText) {
      this.updateActiveFilters(filterText);
    }

    this.showFilterMenu = false;
    this.loadPaginatedProductos();
  }

  // Limpiar todos los filtros
  clearFilters(): void {
    this.filters = {};
    this.sortField = 'createdAt';
    this.sortOrder = 'desc';
    this.activeFilters = [];
    this.currentPage = 0;
    this.showFilterMenu = false;
    this.isFiltering = false;
    this.loadPaginatedProductos();
  }

  // Actualizar lista de filtros activos
  updateActiveFilters(filterText: string): void {
    const filterType = filterText.split(':')[0];
    this.removeActiveFilter(filterType);
    this.activeFilters.push(filterText);
    this.isFiltering = true;
  }

  // Eliminar un filtro específico
  removeActiveFilter(filterType: string): void {
    this.activeFilters = this.activeFilters.filter(
      (filter) => !filter.startsWith(filterType + ':'),
    );
  }

  // Eliminar un filtro específico y recargar datos
  removeFilter(filterType: string): void {
    switch (filterType) {
      case 'Texto':
        delete this.filters.q;
        break;
      case 'Marca':
        delete this.filters.idMarca;
        break;
      case 'Estado':
        delete this.filters.estado;
        break;
      case 'Nombre':
      case 'Fecha':
        this.sortField = 'createdAt';
        this.sortOrder = 'desc';
        break;
    }

    this.removeActiveFilter(filterType);
    this.currentPage = 0;
    this.isFiltering = this.activeFilters.length > 0;
    this.loadPaginatedProductos();
  }

  // Cambiar ordenamiento
  changeSorting(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'desc';
    }
    this.loadPaginatedProductos();
  }

  eliminarProducto(element: any): void {
    if (!element._id) {
      console.error('ID de usuario no encontrado:', element);
      return;
    }

    const dialogRef = this.dialog.open(AlertDeleteComponent, {
      width: '400px',
      data: {
        item: element,
        itemType: 'usuario',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productosService.deleteProducto(element._id).subscribe({
          next: () => {
            this.loadPaginatedProductos(); // Recargar usuarios después de eliminar
            this.loadDashboardStats(); // Recargar estadísticas también
            this.mostrarAlertaExito();
          },
          error: (error) => {
            console.error('Error al eliminar el usuario', error);
            this.snackBar.open(
              'Error al eliminar el usuario. Por favor, intente nuevamente.',
              'Cerrar',
              {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'bottom',
                panelClass: ['error-snackbar'],
              },
            );
          },
        });
      }
    });
  }

  private mostrarAlertaExito() {
    this.snackBar.openFromComponent(AlertSuccessComponent, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
      data: { message: 'El producto ha sido eliminado' }, // Mensaje personalizado
    });
  }

  abrirModal(): void {
    const dialogRef = this.dialog.open(ProductoModalComponent, {
      width: '400px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginatedProductos();
        this.loadDashboardStats();
      }
    });
  }

  openMarcaFilterDialog(): void {
    const dialogRef = this.dialog.open(MarcaFilterDialogComponent, {
      width: '300px',
      data: { marcas: this.marcas, selectedMarcaId: this.filters.idMarca },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.filters.idMarca = result.marcaId;
        this.updateActiveFilters('Marca: ' + result.marcaNombre);
        this.currentPage = 0;
        this.loadPaginatedProductos();
      }
      this.showFilterMenu = false;
    });
  }

  // Current incorrect implementation
  // Fixed implementation - replace your current function with this one
  abrirModalActualizar(producto: any): void {
    // Make sure you're passing the actual product object, not a component class
    const dialogRef = this.dialog.open(ProductsModalComponent, {
      width: '500px',
      data: { producto: producto }, // Pass the product object from your parameter
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginatedProductos(); // Reload products after update
        this.loadDashboardStats(); // Reload statistics if needed
      }
    });
  }
}
