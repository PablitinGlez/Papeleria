import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { UserModalComponent } from '../../components/user-modal/user-modal.component'; // Importa el modal

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MatTableModule, CommonModule, MatDialogModule], // Agrega MatDialogModule
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent {
  displayedColumns: string[] = [
    'id',
    'nombre',
    'correo',
    'rol',
    'estado',
    'fechaCreacion',
    'fechaActualizacion',
    'actualizar',
    'eliminar',
  ];

  dataSource = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      correo: 'juan@example.com',
      rol: 'Admin',
      estado: 'Activo',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    },
    {
      id: 2,
      nombre: 'María López',
      correo: 'maria@example.com',
      rol: 'Usuario',
      estado: 'Inactivo',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    },
  ];

  constructor(public dialog: MatDialog) {} // Inyecta MatDialog en el constructor

  abrirModal(): void {
    const dialogRef = this.dialog.open(UserModalComponent, {
      width: '400px',
      data: {}, // Puedes enviar datos si es necesario
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Usuario agregado:', result);
        this.dataSource = [...this.dataSource, result]; // Agregar usuario a la tabla
      }
    });
  }

  actualizarUsuario(element: any) {
    console.log('Actualizar usuario:', element);
    this.abrirModal(); // Puedes pasar `element` en data para editar
  }

  eliminarUsuario(element: any) {
    console.log('Eliminar usuario:', element);
    this.dataSource = this.dataSource.filter((user) => user.id !== element.id);
  }
}
