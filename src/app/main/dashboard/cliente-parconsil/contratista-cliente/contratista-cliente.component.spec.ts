import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratistaClienteComponent } from './contratista-cliente.component';

describe('ContratistaClienteComponent', () => {
  let component: ContratistaClienteComponent;
  let fixture: ComponentFixture<ContratistaClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContratistaClienteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContratistaClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
