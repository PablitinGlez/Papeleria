import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleFilterDialogComponent } from './role-filter-dialog.component';

describe('RoleFilterDialogComponent', () => {
  let component: RoleFilterDialogComponent;
  let fixture: ComponentFixture<RoleFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleFilterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
