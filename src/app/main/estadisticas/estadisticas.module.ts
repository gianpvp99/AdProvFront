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
import { FileUploadModule } from 'ng2-file-upload';
import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';
import { CoreTouchspinModule } from '@core/components/core-touchspin/core-touchspin.module';
import { CoreSidebarModule } from '@core/components';
import { NgApexchartsModule } from 'ng-apexcharts';
import { EstadisticasComponent } from '../estadisticas/estadisticas.component';

const routes: Routes = [
  {
    path: '',
    component: EstadisticasComponent
  }
];

// const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
//   // suppressScrollX: true,
//   // wheelPropagation: false
// };

@NgModule({
  declarations: [    
    EstadisticasComponent
  ],
  imports: [
    CommonModule,
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
    NgApexchartsModule,
    PerfectScrollbarModule,
    NgxMaskModule.forRoot(),
    SweetAlert2Module.forRoot(),
    BlockUIModule.forRoot()
  ],
  providers: [
    // {
    //   provide: [PERFECT_SCROLLBAR_CONFIG],
    //   useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    // }
  ],
})
export class EstadisticasModule {
}
