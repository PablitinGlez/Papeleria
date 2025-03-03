import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertCreateComponent } from './alert-create.component';

describe('AlertCreateComponent', () => {
  let component: AlertCreateComponent;
  let fixture: ComponentFixture<AlertCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
