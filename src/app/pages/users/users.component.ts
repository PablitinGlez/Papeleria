import { CommonModule } from '@angular/common'; // Asegúrate de importar CommonModule
import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table'; // Asegúrate de importar MatTableModule

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MatTableModule, CommonModule], // Importa MatTableModule y CommonModule aquí
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

  actualizarUsuario(element: any) {
    console.log('Actualizar usuario:', element);
    // Aquí puedes abrir un modal o formulario para editar
  }

  eliminarUsuario(element: any) {
    console.log('Eliminar usuario:', element);
    // Aquí puedes mostrar una confirmación antes de eliminar
  }
}
