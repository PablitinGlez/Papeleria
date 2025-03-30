import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
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
import { ProductosService } from '../../auth/data-access/productos.service';

@Component({
  selector: 'app-products-update',
  templateUrl: './products-update.component.html',
  styleUrls: ['./products-update.component.css'],
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
})
export class ProductsModalComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  productoForm: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  previewImageUrl: string | ArrayBuffer | null = null;
  deleteCurrentImage = false;

  // Marcas para el select
  marcas: { _id: string; nombre: string }[] = [];
  categorias: { _id: string; nombre: string }[] = [];
  // Estados para el select
  estados = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productoService: ProductosService,
    private snackBar: MatSnackBar,
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      precioDescuento: [null], // Opcional
      stock: ['', [Validators.required, Validators.min(0)]],
      idMarca: ['', [Validators.required]],
      idCategoria: ['', [Validators.required]], // Añadir esta línea
      estado: ['activo', [Validators.required]],
    });
  }

  ngOnInit() {
    // Cargar las marcas desde el servicio
    this.loadMarcas();
    this.loadCategorias();
    // Si estamos editando, cargar los datos del producto
    if (this.data && this.data.producto) {
      console.log('Cargando datos de producto:', this.data.producto);
      this.loadProductData(this.data.producto);
    }
  }

  // Método para cargar las marcas
  loadMarcas() {
    this.productoService.getMarcas().subscribe({
      next: (marcas) => {
        this.marcas = marcas;
        console.log('Marcas cargadas:', this.marcas);

        // Si ya tenemos el producto cargado, actualizar el formulario
        if (this.data && this.data.producto) {
          this.loadProductData(this.data.producto);
        }
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
  }
  // Método para cargar las categorías
  loadCategorias() {
    this.productoService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        console.log('Categorías cargadas:', this.categorias);

        // Si ya tenemos el producto cargado, actualizar el formulario
        if (this.data && this.data.producto) {
          this.loadProductData(this.data.producto);
        }
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

  // Cargar datos del producto para edición
  loadProductData(producto: any) {
    console.log('Datos recibidos del producto:', producto);

    // Asegúrate de que el formulario se actualice con los valores correctos
    this.productoForm.patchValue({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio || 0,
      precioDescuento: producto.precioDescuento || null,
      stock: producto.stock || 0,
      idMarca: producto.idMarca?._id || producto.idMarca || '',
      idCategoria: producto.idCategoria?._id || producto.idCategoria || '', // Añadir esta línea
      estado: producto.estado || 'activo',
    });

    // Cargar la imagen previa si existe
    if (producto.imageUrl) {
      this.previewImageUrl = producto.imageUrl;
      this.deleteCurrentImage = false;
    }

    console.log('Formulario actualizado:', this.productoForm.value);
  }

  // Manejar la acción de arrastrar sobre la zona de drop
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Manejar el soltar archivos en la zona de drop
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

  // Manejar la selección de archivos por input
  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    const files = element.files;

    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  // Procesar el archivo seleccionado
  handleFile(file: File) {
    // Verificar que sea una imagen
    if (!file.type.match(/image\/*/)) {
      this.snackBar.open('Por favor selecciona una imagen válida', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      });
      return;
    }

    // Guardar el archivo y mostrar vista previa
    this.selectedFile = file;
    this.deleteCurrentImage = false;

    // Generar vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImageUrl = e.target?.result || null;
    };
    reader.readAsDataURL(file);
  }

  // Eliminar la imagen seleccionada o existente
  deleteImage() {
    this.selectedFile = null;
    this.previewImageUrl = null;
    this.deleteCurrentImage = true;

    // Resetear el input file
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Cerrar el modal
  onNoClick(): void {
    this.dialogRef.close();
  }

  // Guardar los cambios del producto
  guardarProducto(): void {
    if (this.productoForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      // Obtener los valores del formulario
      const formValues = this.productoForm.value;

      // Añadir todos los campos al FormData
      Object.keys(formValues).forEach((key) => {
        // Solo añadir valores que no sean null o undefined
        if (formValues[key] !== null && formValues[key] !== undefined) {
          formData.append(key, formValues[key]);
        }
      });

      // Añadir la imagen si hay una nueva
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      // Añadir flag para eliminar imagen
      formData.append('deleteImage', this.deleteCurrentImage.toString());

      // Log para depuración
      console.log('Form data keys:', Array.from(formData.keys()));

      // Determinar si es actualización o creación
      if (this.data && this.data.producto && this.data.producto._id) {
        // Actualizar producto existente
        this.productoService
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
        this.productoService.createProducto(formData).subscribe({
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

  // Marcar todos los controles como touched para mostrar errores
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Obtener mensaje de error para el campo especificado
  getErrorMessage(controlName: string): string {
    const control = this.productoForm.get(controlName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (control.hasError('minlength')) {
      const requiredLength = control.getError('minlength').requiredLength;
      return `Debe tener al menos ${requiredLength} caracteres`;
    }

    if (control.hasError('min')) {
      const min = control.getError('min').min;
      return `El valor debe ser mayor o igual a ${min}`;
    }

    if (control.hasError('email')) {
      return 'Por favor ingrese un correo electrónico válido';
    }

    return 'Campo inválido';
  }

  // Validar que solo se ingresen números en campos numéricos
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;

    // Permitir teclas especiales
    const specialKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End',
      '.',
      ',',
    ];

    if (target.type === 'number') {
      // Solo permitir números y algunas teclas especiales
      const isNumber = /^[0-9]$/.test(event.key);
      const isSpecialKey = specialKeys.includes(event.key);
      const isCtrlKey = event.ctrlKey || event.metaKey;

      if (!isNumber && !isSpecialKey && !isCtrlKey) {
        event.preventDefault();
      }

      // Permitir solo un punto decimal
      if (
        (event.key === '.' || event.key === ',') &&
        target.value.includes('.')
      ) {
        event.preventDefault();
      }
    }
  }
}
