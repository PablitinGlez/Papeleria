import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Header from '@components/header';

@Component({
  selector: 'app-page-layout',
  imports: [RouterOutlet, Header],
  template: `
   <!--header-->
    <main>
      <router-outlet />
    </main>
  `,
})
export default class PageLayout {}
