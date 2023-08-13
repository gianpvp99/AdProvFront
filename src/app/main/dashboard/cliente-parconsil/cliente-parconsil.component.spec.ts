import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteParconsilComponent } from './cliente-parconsil.component';

describe('ClienteParconsilComponent', () => {
  let component: ClienteParconsilComponent;
  let fixture: ComponentFixture<ClienteParconsilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClienteParconsilComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClienteParconsilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
