import { CommonModule, DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { AlertSuccessComponent } from '@components/alert-success/alert-success.component';
import { RoleFilterDialogComponent } from '@components/role-filter-dialog/role-filter-dialog.component';
import { StatusFilterDialogComponent } from '@components/status-filter-dialog/status-filter-dialog.component';
import { UserModalComponent } from '@components/user-modal/user-modal.component';
import { Chart, registerables } from 'chart.js';
import { UserService } from 'src/app/auth/data-access/user.service';
import { AlertDeleteComponent } from '../../components/alert-delete/alert-delete.component';

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
  selector: 'app-users',
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
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlEs }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Agregar CUSTOM_ELEMENTS_SCHEMA aquí
})
export class UsersComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;
  pieChartInstance: Chart | null = null;

  // Datos para el dashboard
  dashboardStats: {
    totalUsuarios: number;
    ultimosUsuarios: any[];
    usuariosPorRol: any[];
  } = {
    totalUsuarios: 0,
    ultimosUsuarios: [],
    usuariosPorRol: []
  };

  displayedColumns: string[] = [
    'imageUrl',
    'nombre',
    'correo',
    'fechaNacimiento',
    'rol',
    'estado',
    'fechaCreacion',
    'fechaActualizacion',
    'actualizar',
    'eliminar',
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
  roles: any[] = [];
  activeFilters: string[] = [];
  isFiltering: boolean = false;

  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    this.loadPaginatedUsers();
    this.loadRoles();
    this.loadDashboardStats();
    this.loadLottiePlayerScript();
  }

  ngAfterViewInit(): void {
    // La gráfica se cargará cuando tengamos datos, en el método loadDashboardStats
  }

  // Cargar estadísticas para el dashboard
  loadDashboardStats(): void {
    this.userService.getDashboardStats().subscribe({
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

  // Inicializar la gráfica de pastel para roles
  initPieChart(): void {
    if (!this.pieChart || !this.dashboardStats.usuariosPorRol.length) return;

    // Destruir la instancia anterior si existe
    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
    }

    const ctx = this.pieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // Datos para la gráfica
    const roleNames = this.dashboardStats.usuariosPorRol.map(item => item.nombre);
    const roleCounts = this.dashboardStats.usuariosPorRol.map(item => item.cantidad);
    
    // Colores para cada rol (puedes personalizarlos)
    const backgroundColors = [
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
    ];

    this.pieChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: roleNames,
        datasets: [{
          data: roleCounts,
          backgroundColor: backgroundColors.slice(0, roleNames.length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Distribución de usuarios por rol'
          }
        }
      }
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

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error al cargar roles', error);
      },
    });
  }

  loadPaginatedUsers(): void {
    this.loading = true;
    this.isFiltering = Object.keys(this.filters).length > 0;

    this.userService
      .getPaginatedUsers(
        this.currentPage,
        this.pageSize,
        this.sortField,
        this.sortOrder,
        this.filters,
      )
      .subscribe({
        next: (response) => {
          this.dataSource = response.items.map((user: any) => ({
            ...user,
            imageUrl: user.imageUrl || 'ruta/a/imagen/por/defecto.png',
            fechaNacimiento: new Date(user.fechaNacimiento),
            fechaCreacion: new Date(user.createdAt),
            fechaActualizacion: new Date(user.updatedAt),
            rol: user.idRol?.nombre || 'No asignado',
          }));

          // Actualizar datos de paginación
          this.totalItems = response.meta.total;
          this.totalPages = response.meta.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar los usuarios', error);
          this.loading = false;
          this.snackBar.open(
            'Error al cargar usuarios. Por favor, intente nuevamente.',
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
    this.loadPaginatedUsers();
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
    this.loadPaginatedUsers();
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
    this.loadPaginatedUsers();
  }

  // Abrir diálogo para filtrar por rol
  openRoleFilterDialog(): void {
    const dialogRef = this.dialog.open(RoleFilterDialogComponent, {
      width: '300px',
      data: { roles: this.roles, selectedRoleId: this.filters.idRol },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.filters.idRol = result.roleId;
        this.updateActiveFilters('Rol: ' + result.roleName);
        this.currentPage = 0;
        this.loadPaginatedUsers();
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
        this.loadPaginatedUsers();
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
    this.loadPaginatedUsers();
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
      case 'Rol':
        delete this.filters.idRol;
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
    this.loadPaginatedUsers();
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
    this.loadPaginatedUsers();
  }

  eliminarUsuario(element: any): void {
    if (!element._id) {
      console.error('ID de usuario no encontrado:', element);
      return;
    }

    const dialogRef = this.dialog.open(AlertDeleteComponent, {
      width: '400px',
      data: element,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.deleteUser(element._id).subscribe({
          next: () => {
            this.loadPaginatedUsers(); // Recargar usuarios después de eliminar
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
    });
  }

  abrirModal(): void {
    const dialogRef = this.dialog.open(UserModalComponent, {
      width: '400px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginatedUsers(); // Recargar usuarios después de agregar uno nuevo
        this.loadDashboardStats(); // Recargar estadísticas también
      }
    });
  }

  // Método auxiliar para formatear fechas
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}