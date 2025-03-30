import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertCreateComponent } from '@components/alert-create/alert-create.component';
import { MarcasService } from '../../auth/data-access/marcas.service';
import { DropZoneImageComponent } from '../../components/drop-zone-image/drop-zone-image.component';

@Component({
  selector: 'app-marcasmodal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    DropZoneImageComponent,
  ],
  templateUrl: './marcasmodal.component.html',
  styleUrls: ['./marcasmodal.component.css'],
})
export class MarcasmodalComponent implements OnInit {
  marcaForm: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  previewImageUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MarcasmodalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private marcasService: MarcasService,
    private snackBar: MatSnackBar,
  ) {
    this.marcaForm = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]+$'),
        ],
      ],
      descripcion: ['', [Validators.required]],
      estado: ['activo', [Validators.required]],
      imageUrl: [''],
    });
  }

  ngOnInit() {
    // Si estamos editando, cargamos los datos existentes
    if (this.data && this.data.marca) {
      this.marcaForm.patchValue({
        nombre: this.data.marca.nombre,
        descripcion: this.data.marca.descripcion,
        estado: this.data.marca.estado,
      });

      // Si hay una imagen existente, la mostramos como preview
      if (this.data.marca.imageUrl) {
        this.previewImageUrl = this.data.marca.imageUrl;
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onFileSelected(file: File) {
    this.selectedFile = file;
    this.marcaForm.patchValue({ imageUrl: 'selected' });
    this.marcaForm.get('imageUrl')?.updateValueAndValidity();

    // Crear una URL para la vista previa
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewImageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  deleteImage() {
    this.selectedFile = null;
    this.previewImageUrl = null;

    // Si estamos editando y hay una imagen existente, marcamos para eliminarla
    if (this.data && this.data.marca && this.data.marca.imageUrl) {
      this.marcaForm.patchValue({ imageUrl: '' });
    }
  }

  guardarMarca(): void {
    if (this.marcaForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      // Añadir los campos del formulario
      formData.append('nombre', this.marcaForm.value.nombre);
      formData.append('descripcion', this.marcaForm.value.descripcion);
      formData.append('estado', this.marcaForm.value.estado);

      // Añadir la imagen si hay una nueva
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      // Determinar si es actualización o creación
      if (this.data && this.data.marca && this.data.marca._id) {
        // Actualización de marca existente
        this.marcasService
          .updateMarca(this.data.marca._id, formData)
          .subscribe({
            next: (response) => {
              this.snackBar.openFromComponent(AlertCreateComponent, {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'bottom',
                panelClass: ['success-snackbar'],
                data: { message: 'La marca ha sido actualizada con éxito!' },
              });
              this.dialogRef.close(response.marca);
            },
            error: (error) => {
              console.error('Error al actualizar marca:', error);
              this.snackBar.open(
                error.error?.message || 'Error al actualizar marca',
                'Cerrar',
                {
                  duration: 3000,
                  horizontalPosition: 'end',
                  verticalPosition: 'bottom',
                  panelClass: ['error-snackbar'],
                },
              );
            },
            complete: () => {
              this.isLoading = false;
            },
          });
      } else {
        // Creación de nueva marca
        this.marcasService.createMarca(formData).subscribe({
          next: (response) => {
            this.snackBar.openFromComponent(AlertCreateComponent, {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
              panelClass: ['success-snackbar'],
              data: { message: 'La marca ha sido creada con éxito!' },
            });
            this.dialogRef.close(response.marca);
          },
          error: (error) => {
            console.error('Error al crear marca:', error);
            this.snackBar.open(
              error.error?.message || 'Error al crear marca',
              'Cerrar',
              {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'bottom',
                panelClass: ['error-snackbar'],
              },
            );
          },
          complete: () => {
            this.isLoading = false;
          },
        });
      }
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.values(this.marcaForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
  }

  // Helpers para validación
  get nombreInvalid(): boolean {
    const control = this.marcaForm.get('nombre');
    return control ? control.invalid && control.touched : false;
  }

  get descripcionInvalid(): boolean {
    const control = this.marcaForm.get('descripcion');
    return control ? control.invalid && control.touched : false;
  }

  get imagenInvalid(): boolean {
    return (
      !this.selectedFile && !this.previewImageUrl && this.marcaForm.touched
    );
  }
}
