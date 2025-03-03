import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { AlertSuccessComponent } from '@components/alert-success/alert-success.component';
import { UserModalComponent } from '@components/user-modal/user-modal.component';
import { UserService } from 'src/app/auth/data-access/user.service';
import { AlertDeleteComponent } from '../../components/alert-delete/alert-delete.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    MatTableModule,
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
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

  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadPaginatedUsers();
  }

  loadPaginatedUsers(): void {
    this.loading = true;

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

  // Aplicar filtros
  applyFilter(filterValue: string): void {
    if (filterValue) {
      this.filters.q = filterValue.trim().toLowerCase();
    } else {
      delete this.filters.q;
    }
    this.currentPage = 0; // Volver a la primera página
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
      }
    });
  }
}
