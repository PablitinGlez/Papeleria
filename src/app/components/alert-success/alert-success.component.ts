// En alert-success.component.ts
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-alert-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-success.component.html',
  styleUrls: ['./alert-success.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-90px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(-20px)' }),
        ),
      ]),
    ]),
  ],
})
export class AlertSuccessComponent {
  constructor(public snackBarRef: MatSnackBarRef<AlertSuccessComponent>) {}
}
