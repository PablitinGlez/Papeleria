import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonBlueComponent } from './button-blue.component';

describe('ButtonBlueComponent', () => {
  let component: ButtonBlueComponent;
  let fixture: ComponentFixture<ButtonBlueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonBlueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonBlueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
