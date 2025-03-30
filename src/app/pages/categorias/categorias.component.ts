// Actualiza el categorias.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  Categoria,
  CategoriasService,
} from '../../auth/data-access/categories.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css'],
})
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private categoriasService: CategoriasService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.isLoading = true;
    this.categoriasService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las categorías';
        this.isLoading = false;
        console.error('Error al cargar categorías:', err);
      },
    });
  }

  verProductosCategoria(categoria: Categoria): void {
    this.router.navigate(['/productos-categoria', categoria._id], {
      state: { categoria: categoria },
    });
  }

  getRandomGradient(): string {
    const gradients = [
      'var(--card-border-gradient-1)',
      'var(--card-border-gradient-2)',
      'var(--card-border-gradient-3)',
      'var(--card-border-gradient-4)',
    ];

    return gradients[Math.floor(Math.random() * gradients.length)];
  }
}
