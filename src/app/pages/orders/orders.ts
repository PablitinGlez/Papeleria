import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { OrdersService } from './orders.service';

@Component({
  selector: 'app-orders',
  template: `
    <section class="max-w-screen-lg mx-auto p-4">
      <h2 class="text-2xl font-bold">Orders</h2>
      <form [formGroup]="form">
        <div class="mb-4 flex flex-col">
          <label class="mb-2" for="order">Order</label>
          <input
            class="border-indigo-600 border rounded-sm p-1"
            formControlName="order"
            type="number"
          />
        </div>

        <div class="mb-4 flex flex-col">
          <label class="mb-2" for="description">Description</label>
          <textarea
            rows="2"
            class="border-indigo-600 border rounded-sm resize-none p-1 h-20"
            formControlName="description"
            type="text"
            style="field-sizing: content;"
          ></textarea>
        </div>
      </form>
    </section>
  `,
  imports: [ReactiveFormsModule],
})
export default class Orders {
  private _fb = inject(FormBuilder);

  private _orderService = inject(OrdersService);

  constructor() {
    this._orderService.isFormCompleted$.next(this.form.valid);

    this.form.valueChanges
      .pipe(
        map(() => this.form.valid),
        takeUntilDestroyed()
      )
      .subscribe((value) => {
        this._orderService.isFormCompleted$.next(value);
      });
  }

  form = this._fb.group({
    order: this._fb.control('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    description: this._fb.control('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });
}
