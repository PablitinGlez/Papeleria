// delete-alert.component.ts
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-alert-delete',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './alert-delete.component.html',
  styleUrls: ['./alert-delete.component.css'],
  providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }], // Proporciona un valor predeterminado para MAT_DIALOG_DATA para evitar error de inyección de dependencia
})
export class AlertDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<AlertDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  confirmarEliminacion(): void {
    this.dialogRef.close(true);
  }

  cancelarEliminacion(): void {
    this.dialogRef.close(false);
  }
}
