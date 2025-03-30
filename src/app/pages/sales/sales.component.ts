import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AlertDeleteComponent } from '@components/alert-delete/alert-delete.component';
import { AlertSuccessComponent } from '@components/alert-success/alert-success.component';
import { SalesService, Venta } from '../../auth/data-access/sales.service';
import { SaleDetailDialogComponent } from '../../components/sale-detail-dialog/sale-detail-dialog.component';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    SaleDetailDialogComponent,
  ],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
  providers: [DatePipe, CurrencyPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalesComponent {
  displayedColumns: string[] = [
    'fechaVenta',
    'cliente',
    'productos',
    'total',
    'estado',
    'acciones',
  ];
  dataSource = new MatTableDataSource<Venta>();
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 100];
  loading = false;
  dashboardStats: any = {
    ultimasVentas: [],
  };
  topClientes: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private salesService: SalesService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadVentas();
    this.loadTopClientes();
  }
  loadDashboardStats(): void {
    this.salesService.getDashboardVentasStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
      },
      error: (err) => console.error('Error loading stats:', err),
    });
  }

  loadVentas(): void {
    this.loading = true;
    this.salesService.getVentas().subscribe({
      next: (response) => {
        this.dataSource.data = response;
        this.totalItems = response.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sales:', err);
        this.loading = false;
      },
    });
  }

  handlePageEvent(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.loadVentas();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.currentPage = 0;
    this.salesService.searchVentas(filterValue).subscribe({
      next: (response) => {
        this.dataSource.data = response;
        this.totalItems = response.length;
      },
      error: (err) => {
        console.error('Error searching sales:', err);
      },
    });
  }

  applyFiltering(sortField: string, sortOrder: string): void {
    this.loadVentas();
  }

  openDetailDialog(venta: Venta): void {
    this.dialog.open(SaleDetailDialogComponent, {
      width: '600px',
      data: { venta },
    });
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  getProductosCount(venta: Venta): string {
    const total = venta.productos.reduce((sum, item) => sum + item.cantidad, 0);
    return `${total} producto${total !== 1 ? 's' : ''}`;
  }

  cancelarVenta(venta: Venta): void {
    if (confirm(`¿Estás seguro de cancelar la venta #${venta._id}?`)) {
      this.salesService.cambiarEstadoVenta(venta._id, 'cancelada').subscribe({
        next: () => {
          this.loadVentas();
          this.loadDashboardStats();
        },
        error: (err) => console.error('Error cancelando venta:', err),
      });
    }
  }

  eliminarVenta(venta: Venta): void {
    if (!venta._id) {
      console.error('ID de venta no encontrado:', venta);
      return;
    }

    const dialogRef = this.dialog.open(AlertDeleteComponent, {
      width: '400px',
      data: {
        item: venta,
        itemType: 'venta',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.salesService.eliminarVenta(venta._id).subscribe({
          next: () => {
            this.loadVentas();
            this.loadDashboardStats();
            this.mostrarAlertaExito();
          },
          error: (error) => {
            console.error('Error al eliminar la venta', error);
            this.snackBar.open(
              'Error al eliminar la venta. Por favor, intente nuevamente.',
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
      data: { message: 'La venta ha sido eliminada correctamente' },
    });
  }

  loadTopClientes(): void {
    this.salesService.getTopClientes(5).subscribe({
      next: (clientes) => {
        this.topClientes = clientes;
      },
      error: (err) => console.error('Error loading top clientes:', err),
    });
  }
}
