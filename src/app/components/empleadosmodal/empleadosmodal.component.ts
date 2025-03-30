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
import { EmpleadosService } from '../../auth/data-access/empleados.services';

@Component({
  selector: 'app-empleadosmodal',
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
  templateUrl: './empleadosmodal.component.html',
  styleUrls: ['./empleadosmodal.component.css'],
})
export class EmpleadosmodalComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  empleadoForm: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  previewImageUrl: string | null = null;
  puestos = ['Cajero', 'Almacenista', 'Vendedor', 'Gerente', 'Administrativo'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmpleadosmodalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private empleadosService: EmpleadosService,
    private snackBar: MatSnackBar,
  ) {
    this.empleadoForm = this.fb.group(
      {
        nombre: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')],
        ],
        apellidos: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')],
        ],
        correo: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(15),
            Validators.pattern(/(?=.*\d)(?=.*[$!%*?&])/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        telefono: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{10}$')],
        ],
        curp: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/),
          ],
        ],
        nss: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
        rfc: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/),
          ],
        ],
        puesto: ['', Validators.required],
        imageUrl: [''],
      },
      {
        validator: this.passwordMatchValidator,
      },
    );
  }

  ngOnInit() {
    if (this.data && this.data.empleado) {
      this.loadEmpleadoData(this.data.empleado);
    }
  }

  loadEmpleadoData(empleado: any) {
    this.empleadoForm.patchValue({
      nombre: empleado.nombre || '',
      apellidos: empleado.apellidos || '',
      correo: empleado.correo || '',
      telefono: empleado.telefono || '',
      curp: empleado.curp || '',
      nss: empleado.nss || '',
      rfc: empleado.rfc || '',
      puesto: empleado.puesto || '',
    });

    if (empleado.imageUrl) {
      this.previewImageUrl = empleado.imageUrl;
    }
  }

  // Métodos para manejar la imagen
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

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImageUrl = (e.target?.result as string) || null;
    };
    reader.readAsDataURL(file);
  }

  deleteImage() {
    this.selectedFile = null;
    this.previewImageUrl = null;

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  guardarEmpleado(): void {
    if (this.empleadoForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      // Añadir campos del formulario
      Object.keys(this.empleadoForm.value).forEach((key) => {
        if (key !== 'imageUrl') {
          formData.append(key, this.empleadoForm.value[key]);
        }
      });

      // Añadir imagen si existe
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      // Crear empleado
      this.empleadosService.createEmpleado(formData).subscribe({
        next: (response) => {
          this.snackBar.openFromComponent(AlertCreateComponent, {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar'],
            data: { message: 'Empleado creado con éxito!' },
          });
          this.dialogRef.close(response.empleado);
        },
        error: (error) => {
          console.error('Error al crear empleado:', error);
          this.snackBar.open(
            error.error?.message || 'Error al crear empleado',
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
      Object.values(this.empleadoForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
  }

  // Getters para validación
  get nombreInvalid(): boolean {
    const control = this.empleadoForm.get('nombre');
    return control ? control.invalid && control.touched : false;
  }

  get apellidosInvalid(): boolean {
    const control = this.empleadoForm.get('apellidos');
    return control ? control.invalid && control.touched : false;
  }

  get correoInvalid(): boolean {
    const control = this.empleadoForm.get('correo');
    return control ? control.invalid && control.touched : false;
  }

  get telefonoInvalid(): boolean {
    const control = this.empleadoForm.get('telefono');
    return control ? control.invalid && control.touched : false;
  }

  get curpInvalid(): boolean {
    const control = this.empleadoForm.get('curp');
    return control ? control.invalid && control.touched : false;
  }

  get nssInvalid(): boolean {
    const control = this.empleadoForm.get('nss');
    return control ? control.invalid && control.touched : false;
  }

  get rfcInvalid(): boolean {
    const control = this.empleadoForm.get('rfc');
    return control ? control.invalid && control.touched : false;
  }

  get puestoInvalid(): boolean {
    const control = this.empleadoForm.get('puesto');
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.empleadoForm.get(controlName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (control.hasError('pattern')) {
      switch (controlName) {
        case 'curp':
          return 'Formato de CURP inválido';
        case 'nss':
          return 'NSS debe tener 11 dígitos';
        case 'rfc':
          return 'Formato de RFC inválido';
        case 'telefono':
          return 'Teléfono debe tener 10 dígitos';
        case 'nombre':
        case 'apellidos':
          return 'Solo se permiten letras';
        default:
          return 'Formato inválido';
      }
    }

    if (control.hasError('email')) {
      return 'Correo electrónico inválido';
    }

    if (control.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }

    if (control.hasError('minlength')) {
      return 'Mínimo 6 caracteres';
    }

    if (control.hasError('maxlength')) {
      return 'Máximo 15 caracteres';
    }

    if (control.hasError('pattern') && controlName === 'password') {
      return 'Debe contener al menos un número y un carácter especial ($!%*?&)';
    }

    return 'Campo inválido';
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  get passwordInvalid(): boolean {
    const control = this.empleadoForm.get('password');
    return control ? control.invalid && control.touched : false;
  }

  get confirmPasswordInvalid(): boolean {
    const control = this.empleadoForm.get('confirmPassword');
    return control ? control.invalid && control.touched : false;
  }

  get passwordLengthValid(): boolean {
    const control = this.empleadoForm.get('password');
    return control?.value?.length >= 6 && control?.value?.length <= 15;
  }

  get passwordNumberValid(): boolean {
    const control = this.empleadoForm.get('password');
    return control?.value && /\d/.test(control.value);
  }

  get passwordSpecialCharValid(): boolean {
    const control = this.empleadoForm.get('password');
    return control?.value && /[$!%*?&]/.test(control.value);
  }
}
