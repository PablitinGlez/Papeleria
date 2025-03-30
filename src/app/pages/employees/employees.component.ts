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
import { MarcasmodalComponent } from '@components/marcasmodal/marcasmodal.component';
import { MarcasmodalupdateComponent } from '@components/marcasmodalupdate/marcasmodalupdate.component';
import { Chart, registerables } from 'chart.js';
import { MarcasService } from 'src/app/auth/data-access/marcas.service';
import { HasPermissionDirective } from 'src/app/core/directives/has-permission.directive';
import { RoleButtonDirective } from 'src/app/core/directives/rolebutton.directive';
import { Permission } from '../../core/services/role.service';
import { MatPaginatorIntlEs } from '../users/MatPaginatorIntl.service';

Chart.register(...registerables);

@Component({
  selector: 'app-marcas',
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
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlEs }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MarcasComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;
  pieChartInstance: Chart | null = null;

  // Datos para el dashboard
  dashboardStats: {
    totalMarcas: number;
    totalMarcasActivas: number;
    ultimasMarcas: any[];
  } = {
    totalMarcas: 0,
    totalMarcasActivas: 0,
    ultimasMarcas: [],
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
    'estado',
    'fechaCreacion',
    'fechaActualizacion',
    'acciones'
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
  activeFilters: string[] = [];
  isFiltering: boolean = false;

  constructor(
    private marcasService: MarcasService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    this.loadPaginatedMarcas();
    this.loadDashboardStats();
    this.loadLottiePlayerScript();
  }

  ngAfterViewInit(): void {
    // La gráfica se cargará cuando tengamos datos, en el método loadDashboardStats
  }

  // Cargar estadísticas para el dashboard
  loadDashboardStats(): void {
    this.marcasService.getDashboardStats().subscribe({
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
    if (!this.pieChart) return;

    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
    }

    const ctx = this.pieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // Datos de ejemplo para la gráfica (ajusta según tu API)
    const data = {
      labels: ['Activas', 'Inactivas'],
      datasets: [
        {
          data: [
            this.dashboardStats.totalMarcasActivas,
            this.dashboardStats.totalMarcas -
              this.dashboardStats.totalMarcasActivas,
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 99, 132, 0.7)',
          ],
          borderWidth: 1,
        },
      ],
    };

    this.pieChartInstance = new Chart(ctx, {
      type: 'pie',
      data: data,
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

  loadPaginatedMarcas(): void {
    this.loading = true;
    this.isFiltering = Object.keys(this.filters).length > 0;

    this.marcasService
      .getPaginatedMarcas(
        this.currentPage,
        this.pageSize,
        this.sortField,
        this.sortOrder,
        this.filters,
      )
      .subscribe({
        next: (response) => {
          this.dataSource = response.items.map((marca: any) => ({
            ...marca,
            fechaCreacion: new Date(marca.createdAt),
            fechaActualizacion: new Date(marca.updatedAt),
          }));

          this.totalItems = response.meta.total;
          this.totalPages = response.meta.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar las marcas', error);
          this.loading = false;
          this.snackBar.open(
            'Error al cargar marcas. Por favor, intente nuevamente.',
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
    this.loadPaginatedMarcas();
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
    this.loadPaginatedMarcas();
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
    this.loadPaginatedMarcas();
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
    this.loadPaginatedMarcas();
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
    this.loadPaginatedMarcas();
  }

  // Cambiar ordenamiento
  changeSorting(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'desc';
    }
    this.loadPaginatedMarcas();
  }

  eliminarMarca(element: any): void {
    if (!element._id) {
      console.error('ID de marca no encontrado:', element);
      return;
    }

    const dialogRef = this.dialog.open(AlertDeleteComponent, {
      width: '400px',
      data: {
        item: element,
        itemType: 'marca',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.marcasService.deleteMarca(element._id).subscribe({
          next: () => {
            this.loadPaginatedMarcas();
            this.loadDashboardStats();
            this.mostrarAlertaExito();
          },
          error: (error) => {
            console.error('Error al eliminar la marca', error);
            this.snackBar.open(
              'Error al eliminar la marca. Por favor, intente nuevamente.',
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
      data: { message: 'La marca ha sido eliminada' },
    });
  }

  abrirModal(): void {
    const dialogRef = this.dialog.open(MarcasmodalComponent, {
      width: '500px',
      data: {}, // Puedes pasar datos si es necesario
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginatedMarcas();
        this.loadDashboardStats();
      }
    });
  }

  abrirModalActualizar(marca: any): void {
    const dialogRef = this.dialog.open(MarcasmodalupdateComponent, {
      width: '500px',
      data: { marca: marca }, // Pasamos la marca existente para edición
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginatedMarcas();
        this.loadDashboardStats();
      }
    });
  }
}
