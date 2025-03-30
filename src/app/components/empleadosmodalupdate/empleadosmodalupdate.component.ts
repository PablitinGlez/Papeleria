import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmpleadosService } from 'src/app/auth/data-access/empleados.services';

@Component({
  selector: 'app-update-empleado-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './empleadosmodalupdate.component.html',
  styleUrls: ['./empleadosmodalupdate.component.css'],
})
export class UpdateEmpleadoModalComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  empleadoForm: FormGroup;
  empleado: any;
  selectedFile: File | null = null;
  isLoading = false;
  previewImageUrl: string | null = null;
  showDeleteImageButton = false;
  imageWasDeleted = false;

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadosService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UpdateEmpleadoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { empleado: any },
  ) {
    this.empleado = data.empleado;
    this.previewImageUrl = this.empleado.imageUrl || null;
    this.showDeleteImageButton = !!this.previewImageUrl;

    this.empleadoForm = this.fb.group({
      nombre: [
        this.empleado.nombre,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          this.soloLetrasValidator(),
        ],
      ],
      apellidos: [
        this.empleado.apellidos,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          this.soloLetrasValidator(),
        ],
      ],
      correo: [this.empleado.correo, [Validators.required, Validators.email]],
      telefono: [
        this.empleado.telefono,
        [
          Validators.required,
          Validators.pattern(/^\d{10}$/),
          this.soloNumerosValidator(),
        ],
      ],
      curp: [
        this.empleado.curp,
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/),
        ],
      ],
      nss: [
        this.empleado.nss,
        [Validators.required, Validators.pattern(/^\d+$/)],
      ],
      rfc: [
        this.empleado.rfc,
        [Validators.required, Validators.pattern(/^[A-Z]{4}\d{6}[A-Z\d]{3}$/)],
      ],
      puesto: [this.empleado.puesto, Validators.required],
    });

    // Deshabilitar campos que no deben editarse
    this.empleadoForm.get('correo')?.disable();
  }

  ngOnInit(): void {}

  // Validador personalizado para aceptar solo letras
  soloLetrasValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      // Acepta letras, espacios, letras con acentos, ñ/Ñ
      const valido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
      return valido ? null : { soloLetras: { value } };
    };
  }

  // Validador personalizado para aceptar solo números
  soloNumerosValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const valido = /^\d+$/.test(value);
      return valido ? null : { soloNumeros: { value } };
    };
  }

  // Mostrar mensaje de error para los campos de formulario
  getErrorMessage(controlName: string): string {
    const control = this.empleadoForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Campo requerido';
    }

    if (controlName === 'nombre' || controlName === 'apellidos') {
      if (control.hasError('minlength')) {
        return `Mínimo ${control.getError('minlength').requiredLength} caracteres`;
      }
      if (control.hasError('maxlength')) {
        return `Máximo ${control.getError('maxlength').requiredLength} caracteres`;
      }
      if (control.hasError('soloLetras')) {
        return 'Solo se permiten letras';
      }
    }

    if (controlName === 'telefono') {
      if (control.hasError('pattern')) {
        return 'Debe tener 10 dígitos';
      }
      if (control.hasError('soloNumeros')) {
        return 'Solo se permiten números';
      }
    }

    if (controlName === 'correo' && control.hasError('email')) {
      return 'Correo electrónico inválido';
    }

    if (controlName === 'curp' && control.hasError('pattern')) {
      return 'Formato de CURP inválido';
    }

    if (controlName === 'nss' && control.hasError('pattern')) {
      return 'Solo se permiten números';
    }

    if (controlName === 'rfc' && control.hasError('pattern')) {
      return 'Formato de RFC inválido';
    }

    return '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.imageWasDeleted = false;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageUrl = e.target?.result as string;
        this.showDeleteImageButton = true;
      };
      reader.readAsDataURL(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.selectedFile = file;
        this.imageWasDeleted = false;

        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImageUrl = e.target?.result as string;
          this.showDeleteImageButton = true;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  deleteImage(): void {
    this.selectedFile = null;
    this.previewImageUrl = null;
    this.showDeleteImageButton = false;
    this.imageWasDeleted = true;

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  guardarEmpleado(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const empleadoData = {
      nombre: this.empleadoForm.get('nombre')?.value,
      apellidos: this.empleadoForm.get('apellidos')?.value,
      telefono: this.empleadoForm.get('telefono')?.value,
      curp: this.empleadoForm.get('curp')?.value,
      nss: this.empleadoForm.get('nss')?.value,
      rfc: this.empleadoForm.get('rfc')?.value,
      puesto: this.empleadoForm.get('puesto')?.value,
    };

    this.empleadoService
      .updateEmpleadoData(
        this.empleado._id,
        empleadoData,
        this.selectedFile,
        this.imageWasDeleted,
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Empleado actualizado exitosamente', 'Cerrar', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al actualizar empleado', error);
          this.snackBar.open('Error al actualizar empleado', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
