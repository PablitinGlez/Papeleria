import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-alert-create',
  templateUrl: './alert-create.component.html',
  styleUrls: ['./alert-create.component.css'],
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
export class AlertCreateComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<AlertCreateComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any, // Recibe los datos
  ) {}
}
