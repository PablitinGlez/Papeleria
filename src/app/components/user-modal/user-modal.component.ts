import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
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
import { UserService } from '../../auth/data-access/user.service';
import { DropZoneImageComponent } from '../../components/drop-zone-image/drop-zone-image.component';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css'],
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
export class UserModalComponent {
  @ViewChild(DropZoneImageComponent) dropZone!: DropZoneImageComponent;
  userForm: FormGroup;
  fechaNacimiento: string = '';
  isLoading = false;
  selectedFile: File | null = null;

  // Variables para validación visual de contraseña
  passwordLengthValid = false;
  passwordNumberValid = false;
  passwordSpecialCharValid = false;
  passwordsMatch = false;

  // Cambia la definición de roles para incluir el _id correcto
  roles: { _id: string; nombre: string; descripcion: string }[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private snackBar: MatSnackBar,
  ) {
    this.userForm = this.fb.group(
      {
        nombre: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')],
        ],
        correo: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.pattern(
              '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            ),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(15),
            Validators.pattern(
              /^(?=.*[0-9])(?=.*[$!%*?&])[a-zA-Z0-9$!%*?&]{6,15}$/,
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        telefono: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{10}$')],
        ],
        fechaNacimiento: ['', [Validators.required]],
        idRol: ['', [Validators.required]],
        imageUrl: [''],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );

    // Suscribirse a cambios en el campo de contraseña para actualizar validaciones visuales
    this.userForm.get('password')?.valueChanges.subscribe((value) => {
      this.updatePasswordValidation(value);
    });

    // Suscribirse a cambios en confirmPassword para actualizar validación de coincidencia
    this.userForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.passwordsMatch =
        this.userForm.get('password')?.value ===
        this.userForm.get('confirmPassword')?.value;
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      // No sobrescribir otros errores que pudiera tener
      const currentErrors = confirmPassword?.errors;
      if (currentErrors && Object.keys(currentErrors).length > 1) {
        const { passwordMismatch, ...restErrors } = currentErrors;
        confirmPassword?.setErrors(restErrors);
      } else {
        confirmPassword?.setErrors(null);
      }
    }
    return null;
  }

  // Validar la contraseña para los indicadores visuales
  updatePasswordValidation(password: string) {
    this.passwordLengthValid = password?.length >= 6 && password?.length <= 15;
    this.passwordNumberValid = /[0-9]/.test(password);
    this.passwordSpecialCharValid = /[$!%*?&]/.test(password);
  }

  // Restricciones de entrada para campos específicos
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;

    if (target.name === 'nombre' || target.id === 'nombre') {
      // Bloquear números y otros caracteres no permitidos
      const isLetter = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key);
      const isControlKey = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Home',
        'End',
      ].includes(event.key);
      const isCtrlCmd = event.ctrlKey || event.metaKey;

      // Prevenir la entrada si no es una letra, tecla de control o combinación de Ctrl/Cmd
      if (!isLetter && !isControlKey && !isCtrlCmd) {
        event.preventDefault();
      }
    }
  }

  ngOnInit() {
    // Cargar los roles desde la base de datos
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        console.log('Roles cargados:', this.roles);
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.snackBar.open('Error al cargar roles', 'Cerrar', {
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

  guardarUsuario(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      // Obtener los valores del formulario
      const formValues = this.userForm.value;

      Object.keys(formValues).forEach((key) => {
        if (key !== 'confirmPassword' && key !== 'imageUrl') {
          formData.append(key, formValues[key]);
        }
      });

      if (this.selectedFile) {
        formData.append('image', this.selectedFile, this.selectedFile.name);
      }

      this.userService.createUser(formData).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          this.snackBar.openFromComponent(AlertCreateComponent, {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar'],
            data: { message: 'El usuario ha sido creado con éxito!' }, // Mensaje personalizado
          });
          this.dialogRef.close(response.usuario);
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          this.snackBar.open(
            error.error?.message || 'Error al crear usuario',
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
      this.markFormGroupTouched(this.userForm);
    }
  }

  onFileSelected(file: File) {
    console.log('Archivo seleccionado:', file);
    this.selectedFile = file;
    this.userForm.patchValue({ imageUrl: 'selected' });
    this.userForm.get('imageUrl')?.updateValueAndValidity();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Método para manejar la imagen desde el DropZone
  handleImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.userForm.patchValue({
        imageUrl: 'selected',
      });
      this.userForm.get('imageUrl')?.updateValueAndValidity();
    }
  }
  changeInputType(type: string) {
    const inputElement = document.getElementById(
      'fechaNacimiento',
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.type = type;
      if (type === 'text' && !this.fechaNacimiento) {
        inputElement.placeholder = 'Fecha de Nacimiento';
      } else if (type === 'date') {
        inputElement.placeholder = '';
      }
    }
  }

  // Helpers para obtener estados de validación
  get nombreInvalid(): boolean {
    const control = this.userForm.get('nombre');
    return control ? control.invalid && control.touched : false;
  }

  get correoInvalid(): boolean {
    const control = this.userForm.get('correo');
    return control ? control.invalid && control.touched : false;
  }

  get telefonoInvalid(): boolean {
    const control = this.userForm.get('telefono');
    return control ? control.invalid && control.touched : false;
  }

  get fechaNacimientoInvalid(): boolean {
    const control = this.userForm.get('fechaNacimiento');
    return control ? control.invalid && control.touched : false;
  }

  get rolInvalid(): boolean {
    const control = this.userForm.get('idRol');
    return control ? control.invalid && control.touched : false;
  }

  get imagenInvalid(): boolean {
    return !this.selectedFile && this.userForm.touched;
  }
}
