import { TestBed } from '@angular/core/testing';

import { ControlIngresoService } from './control-ingreso.service';

describe('ControlIngresoService', () => {
  let service: ControlIngresoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControlIngresoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
