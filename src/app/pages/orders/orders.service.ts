import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  isFormCompleted$ = new BehaviorSubject<boolean>(false);
}
