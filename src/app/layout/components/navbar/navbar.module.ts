import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule,
  PERFECT_SCROLLBAR_CONFIG
} from 'ngx-perfect-scrollbar';

import { CoreCommonModule } from '@core/common.module';
import { CoreTouchspinModule } from '@core/components/core-touchspin/core-touchspin.module';

import { NavbarComponent } from 'app/layout/components/navbar/navbar.component';
import { NavbarSearchComponent } from 'app/layout/components/navbar/navbar-search/navbar-search.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelPropagation: false
};

@NgModule({
  declarations: [
    NavbarComponent,
    NavbarSearchComponent,
  ],
  imports: [RouterModule, NgbModule, CoreCommonModule, PerfectScrollbarModule, CoreTouchspinModule],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  exports: [NavbarComponent]
})
export class NavbarModule {}
