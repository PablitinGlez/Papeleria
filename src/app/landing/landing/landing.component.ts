import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { HeroComponent } from '../components/hero/hero.component';
import { ServicesComponent } from '../components/services/services.component';



import { AboutComponent } from '../components/about/about.component';
import { CommunityComponent } from '../components/community/community.component';
import { ContactComponent } from '../components/contact/contact.component';
import { FeaturesComponent } from '../components/features/features.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    AboutComponent,
    CommunityComponent,
    ContactComponent,
    FeaturesComponent,
    FooterComponent,
    HeaderComponent,
    HeroComponent,
    ServicesComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {}
