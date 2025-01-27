import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-blue',
  imports: [],
  templateUrl: './button-blue.component.html',
  styleUrl: './button-blue.component.css',
  standalone: true,
})
export class ButtonBlueComponent {
  @Input() text: string = 'Botón'; // Texto predeterminado
}
