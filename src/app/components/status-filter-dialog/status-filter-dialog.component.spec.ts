import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusFilterDialogComponent } from './status-filter-dialog.component';

describe('StatusFilterDialogComponent', () => {
  let component: StatusFilterDialogComponent;
  let fixture: ComponentFixture<StatusFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusFilterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
