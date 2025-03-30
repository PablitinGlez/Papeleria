import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-lock-icon',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="lock-container">
      <mat-icon
        class="lock-icon"
        [matTooltip]="tooltipMessage"
        aria-hidden="false"
      >
        lock
      </mat-icon>
    </div>
  `,
  styles: [
    `
      .lock-container {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
      }
      .lock-icon {
        color: #888;
        font-size: 24px;
      }
    `,
  ],
})
export class LockIconComponent {
  @Input() tooltipMessage: string = 'No tienes permiso para esta acción';
}
