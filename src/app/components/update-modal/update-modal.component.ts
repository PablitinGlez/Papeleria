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
import { UserService } from 'src/app/auth/data-access/user.service';

@Component({
  selector: 'app-update-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './update-modal.component.html',
  styleUrls: ['./update-modal.component.css'],
})
export class UpdateModalComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  userForm: FormGroup;
  usuario: any;
  selectedFile: File | null = null;
  isLoading = false;
  roles: any[] = [];
  previewImageUrl: string | null = null;
  showDeleteImageButton = false;
  imageWasDeleted = false;

  // Define estados options for the dropdown
  estados: { value: string; label: string }[] = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UpdateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario: any },
  ) {
    this.usuario = data.usuario;
    this.previewImageUrl = this.usuario.imageUrl || null;
    this.showDeleteImageButton = !!this.previewImageUrl;

    this.userForm = this.fb.group({
      nombre: [
        this.usuario.nombre,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          this.soloLetrasValidator(),
        ],
      ],
      telefono: [
        this.usuario.telefono,
        [
          Validators.required,
          Validators.pattern(/^\d{10}$/),
          this.soloNumerosValidator(),
        ],
      ],
      correo: [this.usuario.correo, Validators.required],
      fechaNacimiento: [
        this.formatDateForInput(this.usuario.fechaNacimiento),
        Validators.required,
      ],
      idRol: [this.usuario.idRol?._id, Validators.required],
      estado: [this.usuario.estado, Validators.required],
    });

    // Deshabilitar los campos que no deben ser editables
    this.userForm.get('correo')?.disable();
    this.userForm.get('fechaNacimiento')?.disable();
  }

  ngOnInit(): void {
    this.loadRoles();
  }

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

  // Prevenir la entrada de caracteres inválidos en el campo de nombre
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

  // Prevenir la entrada de caracteres inválidos en el campo de teléfono
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

  // Mostrar mensaje de error para los campos de formulario
  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Campo requerido';
    }

    if (controlName === 'nombre') {
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

    return '';
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error al cargar roles', error);
        this.snackBar.open('No se pudieron cargar los roles', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // If we select a new file, we're not deleting the image anymore
      this.imageWasDeleted = false;

      // Create preview for the selected file
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageUrl = e.target?.result as string;
        this.showDeleteImageButton = true;
      };
      reader.readAsDataURL(file);

      console.log('New file selected:', file.name);
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

        // Create preview
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

    // Reset file input value
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    console.log('Image marked for deletion');
  }

  guardarUsuario(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const userData = {
      nombre: this.userForm.get('nombre')?.value,
      telefono: this.userForm.get('telefono')?.value,
      idRol: this.userForm.get('idRol')?.value,
      estado: this.userForm.get('estado')?.value,
    };

    console.log('Saving user with file:', this.selectedFile ? 'Yes' : 'No');
    console.log('Image was deleted:', this.imageWasDeleted);
    console.log('Estado value:', userData.estado);

    // Call the updated service method with file and deleteImage flag
    this.userService
      .updateUserData(
        this.usuario._id,
        userData,
        this.selectedFile,
        this.imageWasDeleted,
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('User updated successfully:', response);
          this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al actualizar usuario', error);
          this.snackBar.open('Error al actualizar usuario', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
