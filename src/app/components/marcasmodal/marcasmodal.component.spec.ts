import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcasmodalComponent } from './marcasmodal.component';

describe('MarcasmodalComponent', () => {
  let component: MarcasmodalComponent;
  let fixture: ComponentFixture<MarcasmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcasmodalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcasmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
