import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  getDocs,
  query,
  setDoc,
  where
} from '@angular/fire/firestore';
import { from, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private firestore: Firestore) {}

  // Verificar si el usuario ya existe en Firestore
  async checkIfUserExists(email: string): Promise<boolean> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // Crear documento de usuario en Firestore
  createUserDocument(user: {
    uid: string;
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
  }): Observable<void> {
    const userDocRef = doc(this.firestore, 'users', user.uid);

    return from(
      setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date(),
      }).then(() => {
        console.log('Usuario creado en Firestore');
      }),
    ).pipe(
      catchError((error) => {
        console.error('Error al crear usuario en Firestore:', error);
        return throwError(() => error);
      }),
    );
  }
}
