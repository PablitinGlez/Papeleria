import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadosmodalComponent } from './empleadosmodal.component';

describe('EmpleadosmodalComponent', () => {
  let component: EmpleadosmodalComponent;
  let fixture: ComponentFixture<EmpleadosmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpleadosmodalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpleadosmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
