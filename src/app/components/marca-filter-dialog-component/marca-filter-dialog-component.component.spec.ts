import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcaFilterDialogComponentComponent } from './marca-filter-dialog-component.component';

describe('MarcaFilterDialogComponentComponent', () => {
  let component: MarcaFilterDialogComponentComponent;
  let fixture: ComponentFixture<MarcaFilterDialogComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcaFilterDialogComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcaFilterDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
