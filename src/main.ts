import { bootstrapApplication } from '@angular/platform-browser';
import AOS from 'aos'; // Importa AOS
import 'aos/dist/aos.css'; // Importa estilos de AOS
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
AOS.init();


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
