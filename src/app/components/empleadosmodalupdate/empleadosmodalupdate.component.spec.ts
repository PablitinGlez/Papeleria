import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadosmodalupdateComponent } from './empleadosmodalupdate.component';

describe('EmpleadosmodalupdateComponent', () => {
  let component: EmpleadosmodalupdateComponent;
  let fixture: ComponentFixture<EmpleadosmodalupdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpleadosmodalupdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpleadosmodalupdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
