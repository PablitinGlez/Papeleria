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
  selector: 'app-role-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Filtrar por rol</h2>
    <mat-dialog-content>
      <div class="radio-group">
        <mat-radio-group [(ngModel)]="selectedRoleId">
          <mat-radio-button
            *ngFor="let role of data.roles"
            [value]="role._id"
            class="radio-button"
          >
            {{ role.nombre }}
          </mat-radio-button>
          <mat-radio-button [value]="null" class="radio-button">
            Todos los roles
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
export class RoleFilterDialogComponent {
  selectedRoleId: string | null;

  constructor(
    public dialogRef: MatDialogRef<RoleFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { roles: any[]; selectedRoleId: string | null },
  ) {
    this.selectedRoleId = data.selectedRoleId;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onApply(): void {
    const selectedRole = this.data.roles.find(
      (role) => role._id === this.selectedRoleId,
    );
    this.dialogRef.close({
      roleId: this.selectedRoleId,
      roleName: selectedRole ? selectedRole.nombre : 'Todos',
    });
  }
}
