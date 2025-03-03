import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertDeleteComponent } from './alert-delete.component';

describe('AlertDeleteComponent', () => {
  let component: AlertDeleteComponent;
  let fixture: ComponentFixture<AlertDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertDeleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
