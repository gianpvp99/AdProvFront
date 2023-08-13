import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionDocEmpComponent } from './revision-doc-emp.component';

describe('RevisionDocEmpComponent', () => {
  let component: RevisionDocEmpComponent;
  let fixture: ComponentFixture<RevisionDocEmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevisionDocEmpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisionDocEmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
