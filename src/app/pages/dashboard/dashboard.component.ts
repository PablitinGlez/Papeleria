import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';
import { CategoriasService } from '../../auth/data-access/categories.service';
import { ProductosService } from '../../auth/data-access/productos.service';
import { ProveedoresService } from '../../auth/data-access/proovedores.service';
import { UserService } from '../../auth/data-access/user.service';
// Import ngx-bootstrap modules
import { HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import {
  WeatherData,
  WeatherForecast,
  WeatherService,
} from '../../auth/data-access/weather.service';

Chart.register(...registerables);
@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    CarouselModule,
    HttpClientModule,
  ],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  isLightMode: boolean = false;
  userName: string = '';
  private userSubscription?: Subscription;
  featuredProducts: any[] = [];

  // Array para almacenar grupos de imágenes del carrusel
  carouselSlides: any[] = [];
  // En dashboard.component.ts
  usersByDayChart: any;
  // En dashboard.component.ts - añade esta variable
  productsByDayChart: any;
  // Variables para el clima
  weatherData: WeatherData | null = null;
  weatherForecast: WeatherForecast[] = [];
  showWeatherCard: boolean = false;
  weatherCity: string = 'Cuitlahuac,Veracruz,mx';
  isLoadingWeather: boolean = false;

  // Todas las imágenes individuales del carrusel
  carouselImages: any[] = [
    {
      url: 'https://tonypapelerias.vtexassets.com/assets/vtex.file-manager-graphql/images/12ffe427-c554-422f-8969-c927b237cc01___e9fe81446bef6cbb35b5cbfec66c79a2.png',
      alt: 'Bolígrafos punto fino',
      title: 'Bolígrafos punto fino',
      description: 'Bolígrafos de alta calidad para escritura precisa',
    },
    {
      url: '/ca2.webp',
      alt: 'Diamantinas y lentejuelas',
      title: 'Diamantinas y lentejuelas',
      description: 'Materiales para manualidades y decoración',
    },
    {
      url: 'https://tonypapelerias.vtexassets.com/assets/vtex.file-manager-graphql/images/d37dc6d6-bfd1-4e28-93b4-52ebafb56aa5___9dc5c881c2874e77aad39091bddf47d5.png',
      alt: 'Lápices con goma',
      title: 'Lápices con goma',
      description: 'Lápices con goma integrada para dibujo y escritura',
    },
    {
      url: 'https://tonypapelerias.vtexassets.com/assets/vtex.file-manager-graphql/images/4318563a-9ac5-44df-8e28-41fc22a441fa___47895d36f199479f02ba35ff13cd328a.png',
      alt: 'Marcadores permanentes',
      title: 'Marcadores permanentes',
      description: 'Marcadores resistentes para todo tipo de superficies',
    },
    {
      url: 'https://tonypapelerias.vtexassets.com/assets/vtex.file-manager-graphql/images/1e97ae82-22b8-4fc4-aee0-921abc98666c___6cd85bc9d1dbd33c10011b786e559aa7.png',
      description: 'Cuadernos de alta calidad para uso diario',
    },
  ];

  // Dashboard statistics
  dashboardStats: {
    totalUsuarios: number;
    totalUsuariosActivos: number;
    ultimosUsuarios: any[];
    usuariosPorRol: any[];
    totalProductos: number;
    totalProveedores: number;
    totalCategorias: number;
  } = {
    totalUsuarios: 0,
    totalUsuariosActivos: 0,
    ultimosUsuarios: [],
    usuariosPorRol: [],
    totalProductos: 0,
    totalProveedores: 0,
    totalCategorias: 0,
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private productosService: ProductosService,
    private proveedoresService: ProveedoresService,
    private categoriasService: CategoriasService,
    private weatherService: WeatherService,
  ) {
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

    // Preparar el carrusel agrupando las imágenes de 4 en 4
    this.prepareCarouselSlides();

    // Cargar estadísticas del dashboard
    this.loadDashboardStats();

    // Cargar productos destacados
    this.loadFeaturedProducts();

    this.loadUsersByDayChart();

    this.loadProductsByDayChart(); // Añade esta línea
  }

  // Método para preparar las slides del carrusel (agrupar de 4 en 4)
  prepareCarouselSlides(): void {
    for (let i = 0; i < this.carouselImages.length; i += 4) {
      this.carouselSlides.push(this.carouselImages.slice(i, i + 4));
    }
  }

  // Método para cargar productos destacados
  loadFeaturedProducts(): void {
    this.productosService.getProductos().subscribe({
      next: (productos) => {
        // Tomamos solo los primeros 4 productos activos
        this.featuredProducts = productos
          .filter((producto) => producto.estado === 'activo')
          .slice(0, 4);
      },
      error: (error) => {
        console.error('Error al cargar productos destacados', error);
      },
    });
  }

  // Método para cargar las estadísticas
  loadDashboardStats(): void {
    // Cargar estadísticas de usuarios
    this.userService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats.totalUsuarios = stats.totalUsuarios;
        this.dashboardStats.totalUsuariosActivos = stats.totalUsuariosActivos;
        this.dashboardStats.ultimosUsuarios = stats.ultimosUsuarios;
        this.dashboardStats.usuariosPorRol = stats.usuariosPorRol;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de usuarios', error);
      },
    });

    // Cargar estadísticas de productos
    this.productosService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats.totalProductos = stats.totalProductos || 0;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de productos', error);
      },
    });

    // Cargar estadísticas de proveedores
    this.proveedoresService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats.totalProveedores = stats.totalProveedores || 0;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de proveedores', error);
      },
    });

    // Cargar estadísticas de categorías
    this.categoriasService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats.totalCategorias = stats.totalCategorias || 0;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de categorías', error);
      },
    });
  }

  // Método para cargar los datos del clima
  loadWeatherData(): void {
    this.isLoadingWeather = true;

    // Obtener el clima actual
    this.weatherService.getCurrentWeather(this.weatherCity).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.isLoadingWeather = false;
        this.showWeatherCard = true;
      },
      error: (error) => {
        console.error('Error al cargar datos del clima', error);
        this.isLoadingWeather = false;
      },
    });

    // Obtener el pronóstico para los próximos días
    this.weatherService.getForecast(this.weatherCity).subscribe({
      next: (forecast) => {
        this.weatherForecast = forecast;
      },
      error: (error) => {
        console.error('Error al cargar pronóstico del clima', error);
      },
    });
  }

  // Método para alternar la visibilidad de la tarjeta de clima
  toggleWeatherCard(): void {
    if (!this.weatherData) {
      this.loadWeatherData();
    } else {
      this.showWeatherCard = !this.showWeatherCard;
    }
  }

  // Método para cerrar la tarjeta de clima
  closeWeatherCard(): void {
    this.showWeatherCard = false;
  }

  // En dashboard.component.ts
  loadUsersByDayChart(): void {
    this.userService.getUsersCreatedByDayOfWeek().subscribe({
      next: (data) => {
        this.createUsersByDayChart(data);
      },
      error: (error) => {
        console.error('Error al cargar datos de usuarios por día', error);
      },
    });
  }

  // En dashboard.component.ts
  createUsersByDayChart(data: any[]): void {
    // Asegúrate de que existe un elemento canvas con id 'usersByDayChart'
    const canvas = document.getElementById(
      'usersByDayChart',
    ) as HTMLCanvasElement;
    if (!canvas) return;

    // Si ya existe un chart, destrúyelo para evitar errores
    if (this.usersByDayChart) {
      this.usersByDayChart.destroy();
    }

    const days = data.map((item) => item.day);
    const counts = data.map((item) => item.count);

    this.usersByDayChart = new Chart(canvas, {
      type: 'line', // Puedes cambiar a 'line' si prefieres una gráfica lineal
      data: {
        labels: days,
        datasets: [
          {
            label: 'Usuarios creados',
            data: counts,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0, // Mostrar solo números enteros
            },
          },
        },
      },
    });
  }

  // En dashboard.component.ts - añade este método
  loadProductsByDayChart(): void {
    this.productosService.getProductsCreatedByDayOfWeek().subscribe({
      next: (data) => {
        this.createProductsByDayChart(data);
      },
      error: (error) => {
        console.error('Error al cargar datos de productos por día', error);
      },
    });
  }

  createProductsByDayChart(data: any[]): void {
    const canvas = document.getElementById(
      'productsByDayChart',
    ) as HTMLCanvasElement;
    if (!canvas) return;

    if (this.productsByDayChart) {
      this.productsByDayChart.destroy();
    }

    const days = data.map((item) => item.day);
    const counts = data.map((item) => item.count);

    this.productsByDayChart = new Chart(canvas, {
      type: 'bar', // Usando gráfico de barras para diferenciar de la otra gráfica
      data: {
        labels: days,
        datasets: [
          {
            label: 'Productos creados',
            data: counts,
            backgroundColor: 'rgba(54, 162, 235, 0.1 )',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  }

  ngOnDestroy() {
    // Limpiar la suscripción cuando el componente se destruye
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
