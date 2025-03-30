import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriasService } from '../../auth/data-access/categories.service';

@Component({
  selector: 'app-update-categoria-modal',
  templateUrl: './update-categoria-modal.component.html',
  styleUrls: ['./update-categoria-modal.component.css'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule],
})
export class UpdateCategoriaModalComponent implements OnInit {
  categoriaForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private categoriasService: CategoriasService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UpdateCategoriaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categoria: any },
  ) {
    this.categoriaForm = this.fb.group({
      nombre: [
        this.data.categoria.nombre,
        [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')],
      ],
      descripcion: [this.data.categoria.descripcion, [Validators.required]],
      estado: [this.data.categoria.estado, [Validators.required]],
    });
  }

  ngOnInit(): void {}

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
        .updateCategoria(this.data.categoria._id, this.categoriaForm.value)
        .subscribe({
          next: (response) => {
            this.snackBar.open('Categoría actualizada con éxito', 'Cerrar', {
              duration: 3000,
            });
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error al actualizar categoría:', error);
            this.snackBar.open('Error al actualizar categoría', 'Cerrar', {
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
}
