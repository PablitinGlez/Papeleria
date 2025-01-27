import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import AOS from 'aos';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
  styleUrl: './app.component.css',
})
export class AppComponent {
  ngOnInit() {
    AOS.init(); // Inicializa AOS
  }
}
