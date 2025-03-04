import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-status-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Filtrar por estado</h2>
    <mat-dialog-content>
      <div class="radio-group">
        <mat-radio-group [(ngModel)]="selectedStatus">
          <mat-radio-button value="activo" class="radio-button">
            Activo
          </mat-radio-button>
          <mat-radio-button value="inactivo" class="radio-button">
            Inactivo
          </mat-radio-button>
          <mat-radio-button [value]="null" class="radio-button">
            Todos los estados
          </mat-radio-button>
        </mat-radio-group>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-button color="primary" (click)="onApply()">Aplicar</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .radio-group {
        display: flex;
        flex-direction: column;
        margin: 15px 0;
      }
      .radio-button {
        margin: 5px 0;
      }
    `,
  ],
})
export class StatusFilterDialogComponent {
  selectedStatus: string | null;

  constructor(
    public dialogRef: MatDialogRef<StatusFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { selectedStatus: string | null },
  ) {
    this.selectedStatus = data.selectedStatus;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onApply(): void {
    const statusNames: Record<string, string> = {
      activo: 'Activos',
      inactivo: 'Inactivos',
    };

    this.dialogRef.close({
      status: this.selectedStatus,
      statusName: this.selectedStatus
        ? statusNames[this.selectedStatus]
        : 'Todos',
    });
  }
}
