import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Inject,
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
import { ProductosService } from '../../auth/data-access/productos.service';
import { DropZoneImageComponent } from '../../components/drop-zone-image/drop-zone-image.component';

@Component({
  selector: 'app-producto-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    DropZoneImageComponent,
  ],
})
export class ProductoModalComponent {
  @ViewChild(DropZoneImageComponent) dropZone!: DropZoneImageComponent;
  @ViewChild('fileInput') fileInput!: ElementRef;

  productoForm: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  marcas: { _id: string; nombre: string }[] = [];
  categorias: { _id: string; nombre: string }[] = []; // Añadir esta línea
  previewImageUrl: string | null = null;
  deleteCurrentImage = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productosService: ProductosService,
    private snackBar: MatSnackBar,
  ) {
    this.productoForm = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]+$'),
        ],
      ],
      descripcion: ['', [Validators.required]],
      precio: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$'),
        ],
      ],
      precioDescuento: [
        '0',
        [Validators.min(0), Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')],
      ],
      idMarca: ['', [Validators.required]],
      idCategoria: ['', [Validators.required]],
      stock: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]+$'),
        ],
      ],
      estado: ['activo', [Validators.required]],
      imageUrl: [''],
    });
  }

  ngOnInit() {
    // Cargar las marcas desde la base de datos
    this.productosService.getMarcas().subscribe({
      next: (marcas) => {
        this.marcas = marcas;
        console.log('Marcas cargadas:', this.marcas);
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
        this.snackBar.open('Error al cargar marcas', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      },
    });

    this.productosService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.snackBar.open('Error al cargar categorías', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      },
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  deleteImage() {
    this.selectedFile = null;
    this.previewImageUrl = null;
    this.deleteCurrentImage = true;

    // Resetear el input file
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    console.log(
      'Imagen marcada para eliminación, deleteCurrentImage =',
      this.deleteCurrentImage,
    );
  }

  // Eliminar la imagen seleccionada o existente

  guardarProducto(): void {
    if (this.productoForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      // Obtener los valores del formulario
      const formValues = this.productoForm.value;

      // Añadir todos los campos al FormData (excepto cualquier campo relacionado con la imagen)
      Object.keys(formValues).forEach((key) => {
        // Solo añadir valores que no sean null o undefined
        if (
          formValues[key] !== null &&
          formValues[key] !== undefined &&
          key !== 'imageUrl'
        ) {
          formData.append(key, formValues[key]);
        }
      });

      // IMPORTANTE: Añadir flag para eliminar imagen ANTES de añadir la nueva imagen
      formData.append('deleteImage', this.deleteCurrentImage.toString());

      // Añadir la imagen si hay una nueva
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      // Log para depuración
      console.log('Form data keys:', Array.from(formData.keys()));
      console.log('deleteImage flag:', this.deleteCurrentImage);

      // Determinar si es actualización o creación
      if (this.data && this.data.producto && this.data.producto._id) {
        // Actualizar producto existente
        this.productosService
          .updateProducto(this.data.producto._id, formData)
          .subscribe({
            next: (response) => {
              console.log('Respuesta del servidor:', response);
              this.snackBar.openFromComponent(AlertCreateComponent, {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'bottom',
                panelClass: ['success-snackbar'],
                data: { message: 'El producto ha sido actualizado con éxito!' },
              });
              this.dialogRef.close(response.producto);
            },
            error: (error) => {
              console.error('Error al actualizar producto:', error);
              this.snackBar.open(
                error.error?.message || 'Error al actualizar producto',
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
        // Crear nuevo producto

        this.productosService.createProducto(formData).subscribe({
          next: (response) => {
            console.log('Respuesta del servidor:', response);
            this.snackBar.openFromComponent(AlertCreateComponent, {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
              panelClass: ['success-snackbar'],
              data: { message: 'El producto ha sido creado con éxito!' },
            });
            this.dialogRef.close(response.producto);
          },
          error: (error) => {
            console.error('Error al crear producto:', error);
            this.snackBar.open(
              error.error?.message || 'Error al crear producto',
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
      this.markFormGroupTouched(this.productoForm);
    }
  }
  // Restricciones de entrada para campos específicos
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;

    // Validación para campo de nombre (solo letras, espacios y teclas de control)
    if (target.name === 'nombre' || target.id === 'nombre') {
      const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
      const isControlKey = event.ctrlKey || event.metaKey;
      const specialKeys = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Space',
      ];

      if (
        !pattern.test(event.key) &&
        !specialKeys.includes(event.key) &&
        !isControlKey
      ) {
        event.preventDefault();
      }
    }

    // Validación para campo de precio (solo números, punto decimal y teclas de control)
    if (target.name === 'precio' || target.id === 'precio') {
      const pattern = /[0-9.]|ArrowLeft|ArrowRight|Backspace|Delete/;
      const isControlKey = event.ctrlKey || event.metaKey;
      const specialKeys = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
      ];

      // Prevenir múltiples puntos decimales
      if (
        event.key === '.' &&
        (target.value.includes('.') || target.value === '')
      ) {
        event.preventDefault();
        return;
      }

      if (
        !pattern.test(event.key) &&
        !specialKeys.includes(event.key) &&
        !isControlKey
      ) {
        event.preventDefault();
      }
    }

    // Validación para campo de stock (solo números enteros)
    if (target.name === 'stock' || target.id === 'stock') {
      const pattern = /^[0-9]$/;
      const isControlKey = event.ctrlKey || event.metaKey;
      const specialKeys = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
      ];

      if (
        !pattern.test(event.key) &&
        !specialKeys.includes(event.key) &&
        !isControlKey
      ) {
        event.preventDefault();
      }
    }
  }

  onFileSelected(file: File) {
    console.log('Archivo seleccionado:', file);
    this.selectedFile = file;
    this.productoForm.patchValue({ imageUrl: 'selected' });
    this.productoForm.get('imageUrl')?.updateValueAndValidity();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Helpers para obtener estados de validación
  get nombreInvalid(): boolean {
    const control = this.productoForm.get('nombre');
    return control ? control.invalid && control.touched : false;
  }

  get categoriaInvalid(): boolean {
    const control = this.productoForm.get('idCategoria');
    return control ? control.invalid && control.touched : false;
  }

  get descripcionInvalid(): boolean {
    const control = this.productoForm.get('descripcion');
    return control ? control.invalid && control.touched : false;
  }

  get precioInvalid(): boolean {
    const control = this.productoForm.get('precio');
    return control ? control.invalid && control.touched : false;
  }

  get precioDescuentoInvalid(): boolean {
    const control = this.productoForm.get('precioDescuento');
    return control ? control.invalid && control.touched : false;
  }

  get stockInvalid(): boolean {
    const control = this.productoForm.get('stock');
    return control ? control.invalid && control.touched : false;
  }

  get marcaInvalid(): boolean {
    const control = this.productoForm.get('idMarca');
    return control ? control.invalid && control.touched : false;
  }

  get imagenInvalid(): boolean {
    return !this.selectedFile && this.productoForm.touched;
  }
}
