import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratistaParconsilComponent } from './contratista-parconsil.component';

describe('ContratistaParconsilComponent', () => {
  let component: ContratistaParconsilComponent;
  let fixture: ComponentFixture<ContratistaParconsilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContratistaParconsilComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContratistaParconsilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
