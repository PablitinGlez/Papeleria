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
import { AlertSuccessComponent } from '@components/alert-success/alert-success.component';
import { StatusFilterDialogComponent } from '@components/status-filter-dialog/status-filter-dialog.component';
//import { UpdateCategoriaModalComponent } from '@components/update-categoria-modal/update-categoria-modal.component';
//import { CategoriaModalComponent } from '@components/categoria-modal/categoria-modal.component';
import { CategoriaModalComponent } from '@components/categoria-modal/categoria-modal.component';
import { UpdateCategoriaModalComponent } from '@components/update-categoria-modal/update-categoria-modal.component';
import { Chart, registerables } from 'chart.js';
import { CategoriasService } from 'src/app/auth/data-access/categories.service';
import { HasPermissionDirective } from 'src/app/core/directives/has-permission.directive';
import { RoleButtonDirective } from 'src/app/core/directives/rolebutton.directive';
import { AlertDeleteComponent } from '../../components/alert-delete/alert-delete.component';
import { Permission } from '../../core/services/role.service';

Chart.register(...registerables);

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
  selector: 'app-categorias',
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
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlEs }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CategoriasComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;
  pieChartInstance: Chart | null = null;

  dashboardStats: {
    totalCategorias: number;
    totalCategoriasActivas: number;
    ultimasCategorias: any[];
  } = {
    totalCategorias: 0,
    totalCategoriasActivas: 0,
    ultimasCategorias: [],
  };

  Permission = {
    READ: 'read' as keyof Permission,
    CREATE: 'create' as keyof Permission,
    UPDATE: 'update' as keyof Permission,
    DELETE: 'delete' as keyof Permission,
  };

  displayedColumns: string[] = [
    'nombre',
    'descripcion',
    'estado',
    'fechaCreacion',
    'fechaActualizacion',
    'acciones'
  ];
  dataSource: any[] = [];

  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  loading: boolean = false;
  totalPages: number = 0;

  sortField: string = 'createdAt';
  sortOrder: string = 'desc';

  filters: any = {};
  showFilterMenu: boolean = false;
  activeFilters: string[] = [];
  isFiltering: boolean = false;

  constructor(
    private categoriasService: CategoriasService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    this.loadPaginatedCategorias();
    this.loadDashboardStats();
    this.loadLottiePlayerScript();
  }

  ngAfterViewInit(): void {
    // La gráfica se cargará cuando tengamos datos, en el método loadDashboardStats
  }

  loadDashboardStats(): void {
    this.categoriasService.getDashboardStats().subscribe({
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

  initPieChart(): void {
    if (!this.pieChart || !this.dashboardStats.ultimasCategorias.length) return;

    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
    }

    const ctx = this.pieChart.nativeElement.getContext('2d');
    if (!ctx) return;

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
        labels: ['Activas', 'Inactivas'],
        datasets: [
          {
            data: [
              this.dashboardStats.totalCategoriasActivas,
              this.dashboardStats.totalCategorias -
                this.dashboardStats.totalCategoriasActivas,
            ],
            backgroundColor: backgroundColors.slice(0, 2),
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

  loadLottiePlayerScript(): void {
    if (!this.document.querySelector('script[src*="dotlottie-player"]')) {
      const script = this.document.createElement('script');
      script.src =
        'https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.js';
      script.type = 'module';
      this.document.body.appendChild(script);
    }
  }

  loadPaginatedCategorias(): void {
    this.loading = true;
    this.isFiltering = Object.keys(this.filters).length > 0;

    this.categoriasService
      .getPaginatedCategorias(
        this.currentPage,
        this.pageSize,
        this.sortField,
        this.sortOrder,
        this.filters,
      )
      .subscribe({
        next: (response) => {
          this.dataSource = response.items.map((categoria: any) => ({
            ...categoria,
            fechaCreacion: new Date(categoria.createdAt),
            fechaActualizacion: new Date(categoria.updatedAt),
          }));

          this.totalItems = response.meta.total;
          this.totalPages = response.meta.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar las categorías', error);
          this.loading = false;
          this.snackBar.open(
            'Error al cargar categorías. Por favor, intente nuevamente.',
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

  handlePageEvent(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPaginatedCategorias();
  }

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
    this.loadPaginatedCategorias();
  }

  toggleFilterMenu(): void {
    this.showFilterMenu = !this.showFilterMenu;
  }

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
    this.loadPaginatedCategorias();
  }

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
        this.loadPaginatedCategorias();
      }
      this.showFilterMenu = false;
    });
  }

  clearFilters(): void {
    this.filters = {};
    this.sortField = 'createdAt';
    this.sortOrder = 'desc';
    this.activeFilters = [];
    this.currentPage = 0;
    this.showFilterMenu = false;
    this.isFiltering = false;
    this.loadPaginatedCategorias();
  }

  updateActiveFilters(filterText: string): void {
    const filterType = filterText.split(':')[0];
    this.removeActiveFilter(filterType);
    this.activeFilters.push(filterText);
    this.isFiltering = true;
  }

  removeActiveFilter(filterType: string): void {
    this.activeFilters = this.activeFilters.filter(
      (filter) => !filter.startsWith(filterType + ':'),
    );
  }

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
    this.loadPaginatedCategorias();
  }

  changeSorting(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'desc';
    }
    this.loadPaginatedCategorias();
  }

  eliminarCategoria(element: any): void {
    if (!element._id) {
      console.error('ID de categoría no encontrado:', element);
      return;
    }

    const dialogRef = this.dialog.open(AlertDeleteComponent, {
      width: '400px',
      data: {
        item: element,
        itemType: 'categoría',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.categoriasService.deleteCategoria(element._id).subscribe({
          next: () => {
            this.loadPaginatedCategorias();
            this.loadDashboardStats();
            this.mostrarAlertaExito();
          },
          error: (error) => {
            console.error('Error al eliminar la categoría', error);
            this.snackBar.open(
              'Error al eliminar la categoría. Por favor, intente nuevamente.',
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
      data: { message: 'La categoría ha sido eliminada' },
    });
  }

  abrirModal(): void {
    const dialogRef = this.dialog.open(CategoriaModalComponent, {
      width: '400px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginatedCategorias();
        this.loadDashboardStats();
      }
    });
  }

  abrirModalActualizar(categoria: any): void {
    const dialogRef = this.dialog.open(UpdateCategoriaModalComponent, {
      width: '500px',
      data: { categoria: categoria },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginatedCategorias();
        this.loadDashboardStats();
      }
    });
  }
}
