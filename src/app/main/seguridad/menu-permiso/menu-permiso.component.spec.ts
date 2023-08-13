import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPermisoComponent } from './menu-permiso.component';

describe('MenuPermisoComponent', () => {
  let component: MenuPermisoComponent;
  let fixture: ComponentFixture<MenuPermisoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuPermisoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuPermisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
