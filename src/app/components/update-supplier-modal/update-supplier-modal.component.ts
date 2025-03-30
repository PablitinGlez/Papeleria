import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { ProveedoresService } from '../../auth/data-access/proovedores.service';

@Component({
  selector: 'app-update-supplier-modal',
  templateUrl: './update-supplier-modal.component.html',
  styleUrls: ['./update-supplier-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
  ],
})
export class UpdateSupplierModalComponent implements OnInit {
  supplierForm: FormGroup;
  isLoading = false;
  categorias: any[] = [];
  showCategoriasDropdown = false;
  proveedor: any;

  // Define estados options for the dropdown
  estados: { value: string; label: string }[] = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ];
  tiposProveedor: { value: string; label: string }[] = [
    { value: 'nacional', label: 'Nacional' },
    { value: 'internacional', label: 'Internacional' },
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UpdateSupplierModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { proveedor: any },
    private proveedoresService: ProveedoresService,
    private snackBar: MatSnackBar,
  ) {
    this.proveedor = data.proveedor;

    // Inicializa el formulario directamente en el constructor
    this.supplierForm = this.fb.group({
      nombre: [
        this.proveedor.nombre,
        [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')],
      ],
      correo: [
        this.proveedor.correo,
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          ),
        ],
      ],
      telefono: [
        this.proveedor.telefono,
        [Validators.required, Validators.pattern('^[0-9]{10}$')],
      ],
      direccion: [this.proveedor.direccion, [Validators.required]],
      rfc: [
        this.proveedor.rfc,
        [Validators.required, Validators.pattern('^[A-Za-z0-9]{13}$')],
      ],
      contactoPrincipal: [
        this.proveedor.contactoPrincipal,
        [Validators.required],
      ],
      tipoProveedor: [this.proveedor.tipoProveedor, [Validators.required]],
      categoriaProductos: this.fb.array([], [Validators.required]),
      estado: [this.proveedor.estado, Validators.required],
    });
  }

  private initForm(): void {
    this.supplierForm = this.fb.group({
      nombre: [
        this.proveedor.nombre,
        [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')],
      ],
      correo: [
        this.proveedor.correo,
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          ),
        ],
      ],
      telefono: [
        this.proveedor.telefono,
        [Validators.required, Validators.pattern('^[0-9]{10}$')],
      ],
      direccion: [this.proveedor.direccion, [Validators.required]],
      rfc: [
        this.proveedor.rfc,
        [Validators.required, Validators.pattern('^[A-Za-z0-9]{13}$')],
      ],
      contactoPrincipal: [
        this.proveedor.contactoPrincipal,
        [Validators.required],
      ],
      tipoProveedor: [this.proveedor.tipoProveedor, [Validators.required]],
      categoriaProductos: this.fb.array([], [Validators.required]),
      estado: [this.proveedor.estado, Validators.required],
    });
  }

  ngOnInit() {
    this.loadCategorias();
  }

  loadCategorias() {
    this.proveedoresService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;

        // Una vez cargadas las categorías, establecemos las seleccionadas por el proveedor
        this.setSelectedCategorias();
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

  setSelectedCategorias() {
    const categoriasArray = this.supplierForm.get(
      'categoriaProductos',
    ) as FormArray;

    // Limpiamos el array primero
    while (categoriasArray.length) {
      categoriasArray.removeAt(0);
    }

    // Añadimos las categorías del proveedor
    if (
      this.proveedor.categoriaProductos &&
      this.proveedor.categoriaProductos.length > 0
    ) {
      this.proveedor.categoriaProductos.forEach((categoria: any) => {
        const categoriaId =
          typeof categoria === 'object' ? categoria._id : categoria;
        categoriasArray.push(new FormControl(categoriaId));
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  toggleCategoriasDropdown(): void {
    this.showCategoriasDropdown = !this.showCategoriasDropdown;
  }

  onCategoriaChange(event: any, categoriaId: string): void {
    const categoriasFormArray = this.supplierForm.get(
      'categoriaProductos',
    ) as FormArray;

    if (event.checked) {
      categoriasFormArray.push(new FormControl(categoriaId));
    } else {
      const index = categoriasFormArray.controls.findIndex(
        (control) => control.value === categoriaId,
      );
      if (index >= 0) {
        categoriasFormArray.removeAt(index);
      }
    }
  }

  isCategoriaSelected(categoriaId: string): boolean {
    const categoriasFormArray = this.supplierForm.get(
      'categoriaProductos',
    ) as FormArray;
    return categoriasFormArray.controls.some(
      (control) => control.value === categoriaId,
    );
  }

  getSelectedCategoriasText(): string {
    const categoriasFormArray = this.supplierForm.get(
      'categoriaProductos',
    ) as FormArray;
    if (categoriasFormArray.length === 0) {
      return 'Selecciona las Categorías';
    }

    const selectedCategorias = this.categorias.filter((cat) =>
      categoriasFormArray.controls.some((control) => control.value === cat._id),
    );

    if (selectedCategorias.length <= 2) {
      return selectedCategorias.map((cat) => cat.nombre).join(', ');
    }

    return `${selectedCategorias.length} categorías seleccionadas`;
  }

  guardarProveedor(): void {
    if (this.supplierForm.valid) {
      this.isLoading = true;

      // Convertir FormArray a array simple para enviar
      const categoriaProductosArray = (
        this.supplierForm.get('categoriaProductos') as FormArray
      ).value;

      const proveedorData = {
        ...this.supplierForm.value,
        categoriaProductos: categoriaProductosArray,
      };

      console.log('Datos a actualizar:', proveedorData);

      this.proveedoresService
        .updateProveedor(this.proveedor._id, proveedorData)
        .subscribe({
          next: (response) => {
            console.log('Proveedor actualizado:', response);
            this.snackBar.openFromComponent(AlertCreateComponent, {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
              panelClass: ['success-snackbar'],
              data: { message: '¡El proveedor ha sido actualizado con éxito!' },
            });
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error al actualizar proveedor:', error);
            this.snackBar.open(
              error.error?.message || 'Error al actualizar proveedor',
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
      this.markFormGroupTouched(this.supplierForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Validación de entrada para el campo de nombre
  validarInputNombre(event: KeyboardEvent): boolean {
    // Permitir teclas de control y navegación
    if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Tab' ||
      event.key === 'Escape' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'Home' ||
      event.key === 'End' ||
      event.key === ' '
    ) {
      return true;
    }

    // Validar que sea una letra, incluyendo acentos y ñ
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/;
    return pattern.test(event.key);
  }

  // Validación de entrada para el campo de teléfono
  validarInputTelefono(event: KeyboardEvent): boolean {
    // Permitir teclas de control y navegación
    if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Tab' ||
      event.key === 'Escape' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      return true;
    }

    // Validar que sea un número
    const pattern = /^[0-9]$/;
    return pattern.test(event.key);
  }

  // Helpers para obtener estados de validación
  get nombreInvalid(): boolean {
    const control = this.supplierForm.get('nombre');
    return control ? control.invalid && control.touched : false;
  }

  get correoInvalid(): boolean {
    const control = this.supplierForm.get('correo');
    return control ? control.invalid && control.touched : false;
  }

  get telefonoInvalid(): boolean {
    const control = this.supplierForm.get('telefono');
    return control ? control.invalid && control.touched : false;
  }

  get direccionInvalid(): boolean {
    const control = this.supplierForm.get('direccion');
    return control ? control.invalid && control.touched : false;
  }

  get rfcInvalid(): boolean {
    const control = this.supplierForm.get('rfc');
    return control ? control.invalid && control.touched : false;
  }

  get contactoPrincipalInvalid(): boolean {
    const control = this.supplierForm.get('contactoPrincipal');
    return control ? control.invalid && control.touched : false;
  }

  get tipoProveedorInvalid(): boolean {
    const control = this.supplierForm.get('tipoProveedor');
    return control ? control.invalid && control.touched : false;
  }

  get categoriaProductosInvalid(): boolean {
    const control = this.supplierForm.get('categoriaProductos');
    return control ? control.invalid && control.touched : false;
  }

  get estadoInvalid(): boolean {
    const control = this.supplierForm.get('estado');
    return control ? control.invalid && control.touched : false;
  }
}
