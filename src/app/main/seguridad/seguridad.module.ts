import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CoreCommonModule } from '@core/common.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxMaskModule } from 'ngx-mask';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { BlockUIModule } from 'ng-block-ui';
import { UsuarioComponent } from './usuario/usuario.component';
import { MenuPermisoComponent } from './menu-permiso/menu-permiso.component';
import { SectorComponent } from './sector/sector.component';
import { RolesComponent } from './roles/roles.component';
//import { GoogleApis } from 'googleapis';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'usuario',
        component: UsuarioComponent,
      },
      {
        path: 'sector',
        component: SectorComponent,
      },
      {
        path: 'roles',
        component: RolesComponent,
      }
    ]
  }
];

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  // suppressScrollX: true,
  // wheelPropagation: false
};

@NgModule({
  declarations: [
    UsuarioComponent,
    MenuPermisoComponent,
    SectorComponent,
    RolesComponent
  ],
  imports: [    
    //GoogleApis,
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    TranslateModule,
    CoreCommonModule,
    ContentHeaderModule,
    NgxDatatableModule,
    Ng2FlatpickrModule,
    NgSelectModule,
    PerfectScrollbarModule,
    NgxMaskModule.forRoot(),
    SweetAlert2Module.forRoot(),
    BlockUIModule.forRoot()
  ],
  providers: [
    {
      provide: [PERFECT_SCROLLBAR_CONFIG],
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
})
export class SeguridadModule { }
