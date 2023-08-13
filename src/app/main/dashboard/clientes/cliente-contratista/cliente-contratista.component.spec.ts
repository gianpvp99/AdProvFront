import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteContratistaComponent } from './cliente-contratista.component';

describe('ClienteContratistaComponent', () => {
  let component: ClienteContratistaComponent;
  let fixture: ComponentFixture<ClienteContratistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClienteContratistaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClienteContratistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
