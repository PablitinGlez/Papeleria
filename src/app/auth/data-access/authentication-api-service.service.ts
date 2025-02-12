import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationApiServiceService {
  private apiUrl = 'http://localhost:3000/api/auth/'; // Reemplaza con la URL de tu API

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  // En el servicio AuthenticationApiServiceService
  signup(
    name: string,
    email: string,
    phone: string,
    birthdate: string,
    password: string // Agregar el parámetro password
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, {
      name,
      email,
      phone,
      birthdate,
      password, // Agregar password al cuerpo de la solicitud
    });
  }
}
