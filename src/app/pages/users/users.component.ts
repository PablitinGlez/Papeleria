import { Component } from '@angular/core';

@Component({
  selector: 'app-users',
  standalone: true,
  template: `<p>users works!</p>`,
  styleUrl: './users.component.css',
})
export class UsersComponent {
  ngOnInit() {
    console.log('UsersComponent initialized');
  }
}
