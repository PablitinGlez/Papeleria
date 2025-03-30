import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcasmodalupdateComponent } from './marcasmodalupdate.component';

describe('MarcasmodalupdateComponent', () => {
  let component: MarcasmodalupdateComponent;
  let fixture: ComponentFixture<MarcasmodalupdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcasmodalupdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcasmodalupdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
