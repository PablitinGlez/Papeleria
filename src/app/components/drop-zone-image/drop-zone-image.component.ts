import { CommonModule } from '@angular/common'; // Import CommonModule
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-drop-zone-image',
  standalone: true, // Mark the component as standalone
  imports: [CommonModule], // Import CommonModule here
  templateUrl: './drop-zone-image.component.html',
  styleUrls: ['./drop-zone-image.component.css'],
})
export class DropZoneImageComponent {
  @ViewChild('fileInput') fileInput!: ElementRef; // Referencia al input de archivo
  @Output() fileSelected = new EventEmitter<File>();
  imagePreview: string | ArrayBuffer | null = null;
  isDraggingOver = false;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.previewImage(file);
      this.fileSelected.emit(file); // Emitir el archivo seleccionado
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOver = false;
  }
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.previewImage(file);
      this.fileSelected.emit(file); // Emitir el archivo seleccionado

      // Actualizar el input file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      this.fileInput.nativeElement.files = dataTransfer.files;
    }
  }

  private previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // Método para eliminar la imagen
  clearImage(): void {
    this.imagePreview = null; // Limpiar la imagen
    this.fileInput.nativeElement.value = ''; // Restablecer el valor del input
  }
}
