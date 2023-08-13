import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratistaClientesComponent } from './contratista-clientes.component';

describe('ContratistaClientesComponent', () => {
  let component: ContratistaClientesComponent;
  let fixture: ComponentFixture<ContratistaClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContratistaClientesComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContratistaClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
