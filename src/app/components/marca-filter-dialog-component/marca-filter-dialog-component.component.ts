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
  selector: 'app-marca-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Filtrar por marca</h2>
    <mat-dialog-content>
      <div class="radio-group">
        <mat-radio-group [(ngModel)]="selectedMarcaId">
          <mat-radio-button
            *ngFor="let marca of data.marcas"
            [value]="marca._id"
            class="radio-button"
          >
            {{ marca.nombre }}
          </mat-radio-button>
          <mat-radio-button [value]="null" class="radio-button">
            Todas las marcas
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
export class MarcaFilterDialogComponent {
  selectedMarcaId: string | null;

  constructor(
    public dialogRef: MatDialogRef<MarcaFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { marcas: any[]; selectedMarcaId: string | null },
  ) {
    this.selectedMarcaId = data.selectedMarcaId;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onApply(): void {
    const selectedMarca = this.data.marcas.find(
      (marca) => marca._id === this.selectedMarcaId,
    );
    this.dialogRef.close({
      marcaId: this.selectedMarcaId,
      marcaNombre: selectedMarca ? selectedMarca.nombre : 'Todas',
    });
  }
}
