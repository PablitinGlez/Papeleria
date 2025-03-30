import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSupplierModalComponent } from './update-supplier-modal.component';

describe('UpdateSupplierModalComponent', () => {
  let component: UpdateSupplierModalComponent;
  let fixture: ComponentFixture<UpdateSupplierModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSupplierModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSupplierModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
