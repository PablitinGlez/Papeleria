import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, RouterLinkActive],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  isLightMode: boolean = false;
  userName: string = '';
  private userSubscription?: Subscription;

  constructor(private authService: AuthService) {
    this.isLightMode = document.body.classList.contains('light-mode');
  }

  ngOnInit() {
    // Suscribirse al observable currentUser$
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        // Usar el nombre según el tipo de login (normal o Google)
        this.userName = user.nombre || user.displayName || 'Usuario';
      }
    });
  }

  ngOnDestroy() {
    // Limpiar la suscripción cuando el componente se destruye
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

}
