import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

// Define an interface for the dialog data
export interface AlertDeleteData {
  item: any; // The item being deleted
  itemType: string; // Type of item: 'usuario', 'producto', 'proveedor', etc.
  customTitle?: string; // Optional custom title
  customMessage?: string; // Optional custom message
}

@Component({
  selector: 'app-alert-delete',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './alert-delete.component.html',
  styleUrls: ['./alert-delete.component.css'],
  providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }], // Default value for MAT_DIALOG_DATA
})
export class AlertDeleteComponent {
  // Default values for title and message
  title: string = 'Eliminar elemento';
  message: string =
    '¿Estás seguro de que deseas eliminar este elemento? Esta acción es permanente y no se puede deshacer.';

  constructor(
    public dialogRef: MatDialogRef<AlertDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlertDeleteData,
  ) {
    // Set title and message based on itemType or custom values
    this.setTitleAndMessage();
  }

  private setTitleAndMessage(): void {
    // If custom title or message is provided, use those
    if (this.data.customTitle) {
      this.title = this.data.customTitle;
    } else if (this.data.itemType) {
      this.title = `Eliminar ${this.data.itemType}`;
    }

    if (this.data.customMessage) {
      this.message = this.data.customMessage;
    } else if (this.data.itemType) {
      this.message = `¿Estás seguro de que deseas eliminar este ${this.data.itemType}? Esta acción es permanente y no se puede deshacer. Todos los datos del ${this.data.itemType} se perderán de manera irreversible.`;
    }
  }

  confirmarEliminacion(): void {
    this.dialogRef.close(true);
  }

  cancelarEliminacion(): void {
    this.dialogRef.close(false);
  }
}
