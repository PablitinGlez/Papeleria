import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Venta } from '../../auth/data-access/sales.service';

@Component({
  selector: 'app-sale-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, CurrencyPipe],
  templateUrl: './sale-detail-dialog.component.html',
  styleUrls: ['./sale-detail-dialog.component.css'],
  providers: [DatePipe],
})
export class SaleDetailDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { venta: Venta },
    private datePipe: DatePipe,
  ) {}

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  getTotalItems(): number {
    return this.data.venta.productos.reduce(
      (sum, item) => sum + item.cantidad,
      0,
    );
  }
  
}
