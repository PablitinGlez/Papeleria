import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleDetailDialogComponent } from './sale-detail-dialog.component';

describe('SaleDetailDialogComponent', () => {
  let component: SaleDetailDialogComponent;
  let fixture: ComponentFixture<SaleDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
