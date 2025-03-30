import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  description: string;
  icon: string;
  date: string;
}

export interface WeatherForecast {
  date: string;
  temperature: number;
}

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey = 'a0f281cdf63656106cbe1ed726f8780e';
  private apiUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private http: HttpClient) {}

  getCurrentWeather(city: string): Observable<WeatherData> {
    const url = `${this.apiUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=es`;

    return this.http.get(url).pipe(
      map((response: any) => {
        const weatherData: WeatherData = {
          city: response.name,
          country: response.sys.country,
          temperature: Math.round(response.main.temp),
          description: response.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`,
          date: this.formatDate(new Date()),
        };
        return weatherData;
      }),
    );
  }

  getForecast(city: string): Observable<WeatherForecast[]> {
    const url = `${this.apiUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric&lang=es`;

    return this.http.get(url).pipe(
      map((response: any) => {
        // Obtenemos solo los pronósticos para los próximos 3 días a las 12:00
        const dailyForecasts: WeatherForecast[] = [];
        const today = new Date();

        // Encontrar pronósticos para los próximos 3 días
        for (let i = 1; i <= 3; i++) {
          const nextDay = new Date(today);
          nextDay.setDate(today.getDate() + i);

          // Encontrar el pronóstico más cercano a las 12:00 para este día
          const dateStr = nextDay.toISOString().split('T')[0];
          const forecastForDay = response.list.find(
            (item: any) =>
              item.dt_txt.includes(dateStr) && item.dt_txt.includes('12:00'),
          );

          if (forecastForDay) {
            dailyForecasts.push({
              date: this.formatDate(new Date(forecastForDay.dt * 1000)),
              temperature: Math.round(forecastForDay.main.temp),
            });
          }
        }

        return dailyForecasts;
      }),
    );
  }

  private formatDate(date: Date): string {
    // Arrays en español
    const days = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const day = days[date.getDay()];
    const dateNum = date.getDate();
    const month = months[date.getMonth()];

    // Formato en español: "Lunes, 17 de Marzo"
    return `${day}, ${dateNum} de ${month}`;
  }
}
