import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkModeClass = 'dark';

  toggleTheme() {
    const body = document.body;
    body.classList.toggle(this.darkModeClass);
  }

  setTheme(isDark: boolean) {
    const body = document.body;
    if (isDark) {
      body.classList.add(this.darkModeClass);
    } else {
      body.classList.remove(this.darkModeClass);
    }
  }
}
