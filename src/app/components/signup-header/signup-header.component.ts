import { Component } from '@angular/core';
import { LanguageDropdownComponent } from "../language-dropdown/language-dropdown.component";

@Component({
  selector: 'app-signup-header',
  imports: [LanguageDropdownComponent],
  templateUrl: './signup-header.component.html',
  styleUrl: './signup-header.component.css',
    standalone: true, // Esto hace que el componente sea standalone
})
export class SignupHeaderComponent {

}
