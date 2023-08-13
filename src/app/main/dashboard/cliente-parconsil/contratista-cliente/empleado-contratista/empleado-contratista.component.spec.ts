import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadoContratistaComponent } from './empleado-contratista.component';

describe('EmpleadoContratistaComponent', () => {
  let component: EmpleadoContratistaComponent;
  let fixture: ComponentFixture<EmpleadoContratistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmpleadoContratistaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpleadoContratistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
