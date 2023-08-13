import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlIngresoComponent } from './control-ingreso.component';

describe('ControlIngresoComponent', () => {
  let component: ControlIngresoComponent;
  let fixture: ComponentFixture<ControlIngresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlIngresoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlIngresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
