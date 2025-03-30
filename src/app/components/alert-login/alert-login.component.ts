import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-alert-login',
  templateUrl: './alert-login.component.html',
  styleUrls: ['./alert-login.component.css'],
  
})
export class AlertLoginComponent {
  @Input() message: string = '';
  @Output() close = new EventEmitter<void>();

  closeAlert() {
    this.close.emit();
  }
}
