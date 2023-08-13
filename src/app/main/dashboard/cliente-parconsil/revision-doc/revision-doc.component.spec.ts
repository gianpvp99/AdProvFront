import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionDocComponent } from './revision-doc.component';

describe('RevisionDocComponent', () => {
  let component: RevisionDocComponent;
  let fixture: ComponentFixture<RevisionDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevisionDocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisionDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
