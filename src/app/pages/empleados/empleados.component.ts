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
//import { EmpleadoModalComponent } from '@components/empleado-modal/empleado-modal.component';
import { RoleFilterDialogComponent } from '@components/role-filter-dialog/role-filter-dialog.component';
import { StatusFilterDialogComponent } from '@components/status-filter-dialog/status-filter-dialog.component';
//import { UpdateEmpleadoModalComponent } from '@components/update-empleado-modal/update-empleado-modal.component';
import { EmpleadosmodalComponent } from '@components/empleadosmodal/empleadosmodal.component';
import { UpdateEmpleadoModalComponent } from '@components/empleadosmodalupdate/empleadosmodalupdate.component';
import { Chart, registerables } from 'chart.js';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { HasPermissionDirective } from 'src/app/core/directives/has-permission.directive';
import { RoleButtonDirective } from 'src/app/core/directives/rolebutton.directive';
import { EmpleadosService } from '../../auth/data-access/empleados.services';
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
    if (length === 0) return `0 de ${length}`;
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
  selector: 'app-empleados',
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
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlEs }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmpleadosComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;
  pieChartInstance: Chart | null = null;

  dashboardStats: {
    totalEmpleados: number;
    totalEmpleadosActivos: number;
    ultimosEmpleados: any[];
    empleadosPorRol: any[];
    empleadosPorPuesto: any[];
  } = {
    totalEmpleados: 0,
    totalEmpleadosActivos: 0,
    ultimosEmpleados: [],
    empleadosPorRol: [],
    empleadosPorPuesto: [],
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
    'correo',
    'telefono',
    'curp',
    'nss',
    'rfc',
    'puesto',
    'acciones',
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
  roles: any[] = [];
  puestos: string[] = [
    'Cajero',
    'Almacenista',
    'Vendedor',
    'Gerente',
    'Administrativo',
  ];
  activeFilters: string[] = [];
  isFiltering: boolean = false;
  private currentUser: any;

  constructor(
    private empleadosService: EmpleadosService,
    public dialog: MatDialog,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.loadPaginatedEmpleados();
      this.loadRoles();
      this.loadDashboardStats();
      this.loadLottiePlayerScript();
    });
  }

  ngAfterViewInit(): void {
    // La gráfica se cargará cuando tengamos datos
  }

  loadDashboardStats(): void {
    this.empleadosService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        setTimeout(() => {
          this.initPieChart();
        }, 0);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas del dashboard', error);
        this.showErrorSnackbar(
          'Error al cargar estadísticas. Por favor, intente nuevamente.',
        );
      },
    });
  }

  initPieChart(): void {
    if (!this.pieChart || !this.dashboardStats.empleadosPorRol.length) return;

    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
    }

    const ctx = this.pieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const roleNames = this.dashboardStats.empleadosPorRol.map(
      (item) => item.nombre,
    );
    const roleCounts = this.dashboardStats.empleadosPorRol.map(
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
        labels: roleNames,
        datasets: [
          {
            data: roleCounts,
            backgroundColor: backgroundColors.slice(0, roleNames.length),
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

  loadRoles(): void {
    this.empleadosService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error al cargar roles', error);
      },
    });
  }

  loadPaginatedEmpleados(): void {
    this.loading = true;
    this.isFiltering = Object.keys(this.filters).length > 0;

    this.empleadosService
      .getPaginatedEmpleados(
        this.currentPage,
        this.pageSize,
        this.sortField,
        this.sortOrder,
        this.filters,
      )
      .subscribe({
        next: (response) => {
          this.dataSource = response.items.map((empleado: any) => ({
            ...empleado,
            imageUrl: empleado.imageUrl || 'assets/default-avatar.png',
            nombreCompleto: `${empleado.nombre} ${empleado.apellidos}`,
            curp: empleado.curp || 'No disponible',
            nss: empleado.nss || 'No disponible',
            rfc: empleado.rfc || 'No disponible',
            puesto: empleado.puesto || 'No asignado',
            salarioFormateado: this.formatCurrency(empleado.salario),
            fechaContratacion: new Date(empleado.fechaContratacion),
            createdAt: new Date(empleado.createdAt),
            updatedAt: new Date(empleado.updatedAt),
          }));

          this.totalItems = response.meta.total;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar los empleados', error);
          this.loading = false;
          this.showErrorSnackbar(
            'Error al cargar empleados. Por favor, intente nuevamente.',
          );
        },
      });
  }
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(value);
  }

  handlePageEvent(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPaginatedEmpleados();
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
    this.loadPaginatedEmpleados();
  }

  toggleFilterMenu(): void {
    this.showFilterMenu = !this.showFilterMenu;
  }

  applyFiltering(field: string, order: string): void {
    this.sortField =
      field === 'fechaContratacion' ? 'fechaContratacion' : field;
    this.sortOrder = order;

    let filterText = '';

    switch (field) {
      case 'nombre':
        filterText = `Nombre: ${order === 'asc' ? 'A-Z' : 'Z-A'}`;
        break;
      case 'fechaContratacion':
        filterText = `Fecha: ${order === 'asc' ? 'Antiguos primero' : 'Recientes primero'}`;
        break;
    }

    if (filterText) {
      this.updateActiveFilters(filterText);
    }

    this.showFilterMenu = false;
    this.loadPaginatedEmpleados();
  }

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
        this.loadPaginatedEmpleados();
      }
      this.showFilterMenu = false;
    });
  }

  openPuestoFilterDialog(): void {
    // Implementar similar a openRoleFilterDialog pero para puestos
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
        this.loadPaginatedEmpleados();
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
    this.loadPaginatedEmpleados();
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
      case 'Rol':
        delete this.filters.idRol;
        break;
      case 'Puesto':
        delete this.filters.puesto;
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
    this.loadPaginatedEmpleados();
  }

  eliminarEmpleado(element: any): void {
    if (!element._id) {
      console.error('ID de empleado no encontrado:', element);
      return;
    }

    const dialogRef = this.dialog.open(AlertDeleteComponent, {
      width: '400px',
      data: {
        item: element,
        itemType: 'empleado',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.empleadosService.deleteEmpleado(element._id).subscribe({
          next: () => {
            this.loadPaginatedEmpleados();
            this.loadDashboardStats();
            this.mostrarAlertaExito('El empleado ha sido eliminado');
          },
          error: (error) => {
            console.error('Error al eliminar el empleado', error);
            this.showErrorSnackbar(
              'Error al eliminar el empleado. Por favor, intente nuevamente.',
            );
          },
        });
      }
    });
  }

  
  abrirModal(): void {
    const dialogRef = this.dialog.open(EmpleadosmodalComponent, {
      width: '500px',
      data: { roles: this.roles, puestos: this.puestos },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginatedEmpleados();
        this.loadDashboardStats();
      }
    });
  }

  abrirModalActualizar(empleado: any): void {
    const dialogRef = this.dialog.open(UpdateEmpleadoModalComponent, {
      width: '500px',
      data: {
        empleado: empleado,
        roles: this.roles,
        puestos: this.puestos,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginatedEmpleados();
        this.loadDashboardStats();
      }
    });
  }
  mostrarAlertaExito(message: string): void {
    this.snackBar.openFromComponent(AlertSuccessComponent, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
      data: { message },
    });
  }

  showErrorSnackbar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }
}
