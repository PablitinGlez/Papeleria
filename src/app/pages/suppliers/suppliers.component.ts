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
import { SupplierModalComponent } from '@components/supplier-modal/supplier-modal.component';
import { UpdateSupplierModalComponent } from '@components/update-supplier-modal/update-supplier-modal.component';
import { Chart, registerables } from 'chart.js';
import { HasPermissionDirective } from 'src/app/core/directives/has-permission.directive';
import { RoleButtonDirective } from 'src/app/core/directives/rolebutton.directive';
import { Permission } from 'src/app/core/services/role.service';
import { ProveedoresService } from '../../auth/data-access/proovedores.service';
import { AlertDeleteComponent } from '../../components/alert-delete/alert-delete.component';
import { AlertSuccessComponent } from '../../components/alert-success/alert-success.component';
import { RoleFilterDialogComponent } from '../../components/role-filter-dialog/role-filter-dialog.component';
import { StatusFilterDialogComponent } from '../../components/status-filter-dialog/status-filter-dialog.component';

// Registrar componentes de Chart.js
Chart.register(...registerables);

// Clase personalizada para la traducción
class MatPaginatorIntlEs extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Elementos por página:';
  override nextPageLabel = 'Siguiente página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0) {
      return `0 de ${length}`;
    }

    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };
}

@Component({
  selector: 'app-suppliers',
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
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlEs }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SuppliersComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;
  pieChartInstance: Chart | null = null;

  // Datos para el dashboard
  dashboardStats: {
    totalProveedores: number;
    totalProveedoresActivos: number;
    ultimosProveedores: any[];
    proveedoresPorTipo: any[];
  } = {
    totalProveedores: 0,
    totalProveedoresActivos: 0,
    ultimosProveedores: [],
    proveedoresPorTipo: [],
  };

  Permission = {
    READ: 'read' as keyof Permission,
    CREATE: 'create' as keyof Permission,
    UPDATE: 'update' as keyof Permission,
    DELETE: 'delete' as keyof Permission,
  };

  displayedColumns: string[] = [
    'nombre',
    'correo',
    'telefono',
    'direccion',
    'rfc',

    'tipoProveedor',

    'acciones',
  ];
  dataSource: any[] = [];

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
  tiposProveedor: string[] = ['nacional', 'internacional'];
  activeFilters: string[] = [];
  isFiltering: boolean = false;

  constructor(
    private proveedoresService: ProveedoresService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    this.loadPaginatedProveedores();
    this.loadDashboardStats();
    this.loadLottiePlayerScript();
  }

  ngAfterViewInit(): void {
    // La gráfica se cargará cuando tengamos datos, en el método loadDashboardStats
  }

  // Cargar estadísticas para el dashboard
  loadDashboardStats(): void {
    this.proveedoresService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        // Una vez que tenemos los datos, inicializamos la gráfica
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

  // Inicializar la gráfica de pastel para tipos de proveedores
  initPieChart(): void {
    if (!this.pieChart || !this.dashboardStats.proveedoresPorTipo.length)
      return;

    // Destruir la instancia anterior si existe
    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
    }

    const ctx = this.pieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // Datos para la gráfica - corregidos según el formato que envía el backend
    const tipoNames = this.dashboardStats.proveedoresPorTipo.map(
      (item) => item._id || 'No especificado',
    );

    const tipoCounts = this.dashboardStats.proveedoresPorTipo.map(
      (item) => item.count,
    );

    // Colores para cada tipo (puedes personalizarlos)
    const backgroundColors = [
      'rgba(33, 150, 243, 0.7)', // Azul brillante
      'rgba(1, 100, 244, 0.7)', // Celeste vibrante
    ];

    this.pieChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: tipoNames,
        datasets: [
          {
            data: tipoCounts,
            backgroundColor: backgroundColors.slice(0, tipoNames.length),
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

  loadPaginatedProveedores(): void {
    this.loading = true;
    this.isFiltering = Object.keys(this.filters).length > 0;

    this.proveedoresService
      .getPaginatedProveedores(
        this.currentPage,
        this.pageSize,
        this.sortField,
        this.sortOrder,
        this.filters,
      )
      .subscribe({
        next: (response) => {
          this.dataSource = response.items.map((proveedor: any) => ({
            ...proveedor,
            tipoProveedor: proveedor.tipoProveedor || 'Sin tipo', // Asegúrate de mapear el tipo de proveedor
          }));

          // Actualizar datos de paginación
          this.totalItems = response.meta.total;
          this.totalPages = response.meta.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar los proveedores', error);
          this.loading = false;
          this.snackBar.open(
            'Error al cargar proveedores. Por favor, intente nuevamente.',
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
    this.loadPaginatedProveedores();
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
    this.currentPage = 0; // Volver a la primera página
    this.loadPaginatedProveedores();
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
    this.loadPaginatedProveedores();
  }

  // Abrir diálogo para filtrar por tipo de proveedor
  openTypeFilterDialog(): void {
    const dialogRef = this.dialog.open(RoleFilterDialogComponent, {
      width: '300px',
      data: {
        tipos: this.tiposProveedor,
        selectedType: this.filters.tipoProveedor,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.filters.tipoProveedor = result.type;
        this.updateActiveFilters('Tipo: ' + result.typeName);
        this.currentPage = 0;
        this.loadPaginatedProveedores();
      }
      this.showFilterMenu = false;
    });
  }

  // Abrir diálogo para filtrar por estado
  openStatusFilterDialog(): void {
    const dialogRef = this.dialog.open(StatusFilterDialogComponent, {
      width: '300px',
      data: { selectedStatus: this.filters.estado },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.filters.estado = result.status;
        this.updateActiveFilters('Estado: ' + result.statusName);
        this.currentPage = 0;
        this.loadPaginatedProveedores();
      }
      this.showFilterMenu = false;
    });
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
    this.loadPaginatedProveedores();
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
      case 'Tipo':
        delete this.filters.tipoProveedor;
        break;
      case 'Estado':
        delete this.filters.estado;
        break;
      case 'Nombre':
      case 'Fecha':
        // Restaurar ordenamiento predeterminado
        this.sortField = 'createdAt';
        this.sortOrder = 'desc';
        break;
    }

    this.removeActiveFilter(filterType);
    this.currentPage = 0;
    this.isFiltering = this.activeFilters.length > 0;
    this.loadPaginatedProveedores();
  }

  // Cambiar ordenamiento
  changeSorting(field: string): void {
    if (this.sortField === field) {
      // Si es el mismo campo, cambiar dirección
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es un campo nuevo, ordenar descendente por defecto
      this.sortField = field;
      this.sortOrder = 'desc';
    }
    this.loadPaginatedProveedores();
  }

  eliminarProveedor(element: any): void {
    if (!element._id) {
      console.error('ID de proveedor no encontrado:', element);
      return;
    }

    const dialogRef = this.dialog.open(AlertDeleteComponent, {
      width: '400px',
      data: {
        item: element,
        itemType: 'proveedor',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.proveedoresService.deleteProveedor(element._id).subscribe({
          next: () => {
            this.loadPaginatedProveedores(); // Recargar proveedores después de eliminar
            this.loadDashboardStats(); // Recargar estadísticas también
            this.mostrarAlertaExito();
          },
          error: (error) => {
            console.error('Error al eliminar el proveedor', error);
            this.snackBar.open(
              'Error al eliminar el proveedor. Por favor, intente nuevamente.',
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
      data: { message: 'El proveedor ha sido eliminado' }, // Mensaje personalizado
    });
  }

  abrirModal(): void {
    const dialogRef = this.dialog.open(SupplierModalComponent, {
      width: '400px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginatedProveedores(); // Recargar proveedores después de agregar uno nuevo
        this.loadDashboardStats(); // Recargar estadísticas también
      }
    });
  }

  abrirModalActualizar(proveedor: any): void {
    const dialogRef = this.dialog.open(UpdateSupplierModalComponent, {
      width: '500px',
      data: { proveedor: proveedor },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginatedProveedores(); // Recargar proveedores después de actualizar
        this.loadDashboardStats(); // Recargar estadísticas también
      }
    });
  }
}
