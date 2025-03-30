import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../auth/data-access/user.service'; // Ajusta la ruta según tu estructura

interface Usuario {
  _id: string;
  nombre: string;
  correo: string;
  fechaNacimiento: Date;
  idRol: {
    _id: string;
    nombre: string;
    descripcion: string;
  };
  estado: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
}

@Component({
  selector: 'app-administradores',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './administradores.component.html',
  styleUrl: './administradores.component.css',
})
export class AdministradoresComponent implements OnInit {
  administradores: Usuario[] = [];
  cargando: boolean = true;
  error: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.cargarAdministradores();
  }

  cargarAdministradores(): void {
    this.cargando = true;
    this.userService.getAdministradores().subscribe({
      next: (admins) => {
        this.administradores = admins;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar administradores:', err);
        this.error = 'Ocurrió un error al cargar los administradores.';
        this.cargando = false;
      },
    });
  }

  abrirCorreo(correo: string): void {
    window.location.href = `mailto:${correo}`;
  }
}
