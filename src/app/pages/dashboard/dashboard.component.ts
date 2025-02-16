import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, RouterLinkActive],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  isLightMode: boolean = false;

  constructor() {
    // Verificar si el tema inicial es light-mode
    this.isLightMode = document.body.classList.contains('light-mode');
  }

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    document.body.classList.toggle('light-mode', this.isLightMode);
  }

  userName = 'Carlos'; // Cambia por el nombre dinámico del usuario
}

