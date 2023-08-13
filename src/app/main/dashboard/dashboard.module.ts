import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CoreCommonModule } from '@core/common.module';
import { CoreCardModule } from '@core/components/core-card/core-card.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { CountdownModule } from 'ngx-countdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxMaskModule } from 'ngx-mask';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { BlockUIModule } from 'ng-block-ui';
import { ContratistasComponent } from '../dashboard/contratistas/contratistas.component';
import { ClientesComponent } from './clientes/clientes.component';
import { FileUploadModule } from 'ng2-file-upload';
import { EmpleadosComponent } from './empleados/empleados.component';
import { ContratistaEmpleadosComponent } from './contratistas/contratista-empleados/contratista-empleados.component';
import { ContratistaParconsilComponent } from './contratista-parconsil/contratista-parconsil.component';
import { ClienteParconsilComponent } from './cliente-parconsil/cliente-parconsil.component';
import { AuditoriaComponent } from './auditoria/auditoria.component';
import { RegimenComponent } from './regimen/regimen.component';
import { DocumentosComponent } from './cliente-parconsil/documentos/documentos.component';
import { ContratistaClienteComponent } from './cliente-parconsil/contratista-cliente/contratista-cliente.component';
import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';
import { CoreTouchspinModule } from '@core/components/core-touchspin/core-touchspin.module';
import { CoreSidebarModule } from '@core/components';
import { UsuariosComponent } from './clientes/usuarios/usuarios.component';
import { ClienteContratistaComponent } from './clientes/cliente-contratista/cliente-contratista.component';
import { CertificadoComponent } from './cliente-parconsil/certificado/certificado.component';
import { RevisionDocComponent } from './cliente-parconsil/revision-doc/revision-doc.component';
import { ContratistaClientesComponent } from './contratistas/contratista-clientes/contratista-clientes.component';
import { EmpleadoContratistaComponent } from './cliente-parconsil/contratista-cliente/empleado-contratista/empleado-contratista.component';
import { RevisionDocEmpComponent } from './cliente-parconsil/contratista-cliente/revision-doc-emp/revision-doc-emp.component';
import { ControlIngresoComponent } from './clientes/control-ingreso/control-ingreso.component';
import { ValidacionQrComponent } from './clientes/validacion-qr/validacion-qr.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'contratistas/contratista-clientes',
        component: ContratistaClientesComponent,
      },
      {
        path: 'contratistas/contratista-empleados',
        component: ContratistaEmpleadosComponent,
      },
      {
        path: 'clientes',
        component: ClientesComponent,
      },
      {
        path: 'clientes/cliente-contratista',
        component: ClienteContratistaComponent,
      },      
      {
        path: 'clientes/usuarios',
        component: UsuariosComponent,
      },
      {
        path: 'clientes/ingreso-empleados',
        component: ControlIngresoComponent,
      },
      {
        path: 'clientes/validacion-qr',
        component: ValidacionQrComponent,
      },
      {
        path: 'empleados',
        component: EmpleadosComponent,
      },
      {
        path: 'contratista-parconsil',
        component: ContratistaParconsilComponent,
      },
      {
        path: 'cliente-parconsil/certificado',
        component: CertificadoComponent,
      },
      {
        path: 'cliente-parconsil/documentos',
        component: DocumentosComponent,
      },
      {
        path: 'cliente-parconsil/revision-doc',
        component: RevisionDocComponent,
      },
      {
        path: 'cliente-parconsil/contratista-cliente',
        component: ContratistaClienteComponent,
      },
      {
        path: 'cliente-parconsil/contratista-cliente/empleado-contratista',
        component: EmpleadoContratistaComponent,
      },
      {
        path: 'cliente-parconsil/contratista-cliente/revision-doc-emp',
        component: RevisionDocEmpComponent,
      },
      {
        path: 'cliente-parconsil',
        component: ClienteParconsilComponent,
      },
      {
        path: 'auditoria',
        component: AuditoriaComponent,
      },
      {
        path: 'regimen',
        component: RegimenComponent,
      }
    ]
  }
];

// const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
//   // suppressScrollX: true,
//   // wheelPropagation: false
// };

@NgModule({
  declarations: [
    ContratistasComponent,
    ClientesComponent,
    EmpleadosComponent,
    ContratistaParconsilComponent,
    ClienteParconsilComponent,
    AuditoriaComponent,
    RegimenComponent,
    DocumentosComponent,
    ContratistaClienteComponent,
    ClienteContratistaComponent,
    UsuariosComponent,
    CertificadoComponent,
    RevisionDocComponent,
    ContratistaClientesComponent,
    ContratistaEmpleadosComponent,
    EmpleadoContratistaComponent,
    RevisionDocEmpComponent,
    ControlIngresoComponent,
    ValidacionQrComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    NgbModule,
    TranslateModule,
    CoreCommonModule,
    CoreCardModule,
    CountdownModule,
    FormsModule,
    ContentHeaderModule,
    FileUploadModule,
    CardSnippetModule,
    CoreTouchspinModule,
    CoreSidebarModule,
    NgxDatatableModule,
    Ng2FlatpickrModule,
    NgSelectModule,
    NgxDocViewerModule,
    PdfViewerModule,
    PerfectScrollbarModule,
    NgxMaskModule.forRoot(),
    SweetAlert2Module.forRoot(),
    BlockUIModule.forRoot(),
    NgApexchartsModule,
  ],
  providers: [
    // {
    //   provide: [PERFECT_SCROLLBAR_CONFIG],
    //   useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    // }
  ],
})
export class DashboardModule {
}
