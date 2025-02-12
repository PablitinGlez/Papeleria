import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
       provideHttpClient(),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'dashboard-a096b',
        appId: '1:1019253624012:web:c86cba87ab800c020dc669',
        storageBucket: 'dashboard-a096b.firebasestorage.app',
        apiKey: 'AIzaSyC2T4RSNXmBC4TxJyvdXBab0qI4RQfp430',
        authDomain: 'dashboard-a096b.firebaseapp.com',
        messagingSenderId: '1019253624012',
      }),
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
