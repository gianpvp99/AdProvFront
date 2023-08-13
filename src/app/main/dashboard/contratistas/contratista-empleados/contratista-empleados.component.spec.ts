import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratistaEmpleadosComponent } from './contratista-empleados.component';

describe('ContratistaEmpleadosComponent', () => {
  let component: ContratistaEmpleadosComponent;
  let fixture: ComponentFixture<ContratistaEmpleadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContratistaEmpleadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContratistaEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
