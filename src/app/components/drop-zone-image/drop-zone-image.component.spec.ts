import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropZoneImageComponent } from './drop-zone-image.component';

describe('DropZoneImageComponent', () => {
  let component: DropZoneImageComponent;
  let fixture: ComponentFixture<DropZoneImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropZoneImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropZoneImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
