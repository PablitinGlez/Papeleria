import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertCreateComponent } from '@components/alert-create/alert-create.component';
import { MarcasService } from '../../auth/data-access/marcas.service';

@Component({
  selector: 'app-marcasmodalupdate',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './marcasmodalupdate.component.html',
  styleUrls: ['./marcasmodalupdate.component.css'],
})
export class MarcasmodalupdateComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  marcaForm: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  previewImageUrl: string | null = null;
  deleteCurrentImage = false;
  estados = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MarcasmodalupdateComponent>,
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
    if (this.data && this.data.marca) {
      this.loadMarcaData(this.data.marca);
    }
  }

  loadMarcaData(marca: any) {
    this.marcaForm.patchValue({
      nombre: marca.nombre || '',
      descripcion: marca.descripcion || '',
      estado: marca.estado || 'activo',
    });

    // Cargar la imagen existente como vista previa
    if (marca.imageUrl) {
      this.previewImageUrl = marca.imageUrl;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer && event.dataTransfer.files) {
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.handleFile(files[0]);
      }
    }
  }

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    const files = element.files;

    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File) {
    if (!file.type.match(/image\/*/)) {
      this.snackBar.open('Por favor selecciona una imagen válida', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      });
      return;
    }

    this.selectedFile = file;
    this.deleteCurrentImage = false;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImageUrl = (e.target?.result as string) || null;
    };
    reader.readAsDataURL(file);
  }

  deleteImage() {
    this.selectedFile = null;
    this.previewImageUrl = null;
    this.deleteCurrentImage = true;

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  guardarMarca(): void {
    if (this.marcaForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      // Añadir campos del formulario
      formData.append('nombre', this.marcaForm.value.nombre);
      formData.append('descripcion', this.marcaForm.value.descripcion);
      formData.append('estado', this.marcaForm.value.estado);

      // Manejo de imágenes
      formData.append('deleteImage', this.deleteCurrentImage.toString());

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      // Actualizar marca
      this.marcasService.updateMarca(this.data.marca._id, formData).subscribe({
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
      // Marcar todos los campos como tocados para mostrar errores
      Object.values(this.marcaForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
  }

  get nombreInvalid(): boolean {
    const control = this.marcaForm.get('nombre');
    return control ? control.invalid && control.touched : false;
  }

  get descripcionInvalid(): boolean {
    const control = this.marcaForm.get('descripcion');
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.marcaForm.get(controlName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (control.hasError('pattern')) {
      return 'Formato de nombre inválido';
    }

    return 'Campo inválido';
  }
}
