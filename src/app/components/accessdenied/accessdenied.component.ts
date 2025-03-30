import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="access-denied-container">
      <div class="access-denied-content">
        <h1>Acceso Denegado</h1>
        <div class="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="96"
            height="96"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"
              fill="rgba(255,71,71,1)"
            />
          </svg>
        </div>
        <p>No tienes permiso para acceder a esta página.</p>
        <button (click)="goBack()" class="back-button">
          Volver al Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .access-denied-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: var(--card-bg-color);
      }

      .access-denied-content {
        text-align: center;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        background-color: var(--card-bg-color);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        width: 100%;
      }

      h1 {
        color: #e53935;
        margin-bottom: 1rem;
      }

      .icon {
        margin: 1.5rem 0;
      }

      p {
        margin-bottom: 2rem;
        color: var(--card-text-color);
      }

      .back-button {
        padding: 0.75rem 1.5rem;
        background-color: #2196f3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.3s;
      }

      .back-button:hover {
        background-color: #1976d2;
      }
    `,
  ],
})
export class AccessDeniedComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
