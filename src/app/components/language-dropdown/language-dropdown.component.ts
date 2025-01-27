import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-language-dropdown',
  imports: [CommonModule], // Include CommonModule here
  templateUrl: './language-dropdown.component.html',
  styleUrl: './language-dropdown.component.css',
})
export class LanguageDropdownComponent {
  isDropdownOpen = false;

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
