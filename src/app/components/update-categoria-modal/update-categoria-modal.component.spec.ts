import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCategoriaModalComponent } from './update-categoria-modal.component';

describe('UpdateCategoriaModalComponent', () => {
  let component: UpdateCategoriaModalComponent;
  let fixture: ComponentFixture<UpdateCategoriaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCategoriaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCategoriaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
