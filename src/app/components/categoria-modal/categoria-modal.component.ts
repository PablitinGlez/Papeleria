import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriasService } from '../../auth/data-access/categories.service';

@Component({
  selector: 'app-categoria-modal',
  templateUrl: './categoria-modal.component.html',
  styleUrls: ['./categoria-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
})
export class CategoriaModalComponent {
  categoriaForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private categoriasService: CategoriasService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CategoriaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.categoriaForm = this.fb.group({
      nombre: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')],
      ],
      descripcion: ['', [Validators.required]],
      estado: ['activo', [Validators.required]],
    });
  }

  get nombreInvalid(): boolean {
    const control = this.categoriaForm.get('nombre');
    return control ? control.invalid && control.touched : false;
  }

  get descripcionInvalid(): boolean {
    const control = this.categoriaForm.get('descripcion');
    return control ? control.invalid && control.touched : false;
  }

  get estadoInvalid(): boolean {
    const control = this.categoriaForm.get('estado');
    return control ? control.invalid && control.touched : false;
  }

  guardarCategoria(): void {
    if (this.categoriaForm.valid) {
      this.isLoading = true;
      this.categoriasService
        .createCategoria(this.categoriaForm.value)
        .subscribe({
          next: (response) => {
            this.snackBar.open('Categoría creada con éxito', 'Cerrar', {
              duration: 3000,
            });
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error al crear categoría:', error);
            this.snackBar.open('Error al crear categoría', 'Cerrar', {
              duration: 3000,
            });
          },
          complete: () => {
            this.isLoading = false;
          },
        });
    } else {
      this.categoriaForm.markAllAsTouched();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;

    // Validación para campo de nombre (solo letras, espacios y teclas de control)
    if (target.name === 'nombre' || target.id === 'nombre') {
      const isLetter = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key);
      const isControlKey = event.ctrlKey || event.metaKey;
      const specialKeys = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Space',
      ];

      // Prevenir entrada de números y otros caracteres no permitidos
      if (
        !isLetter &&
        !specialKeys.includes(event.key) &&
        !isControlKey &&
        /\d/.test(event.key) // Específicamente prevenir números
      ) {
        event.preventDefault();
      }
    }
  }
}
