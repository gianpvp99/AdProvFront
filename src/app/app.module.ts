import {Injector, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';

import 'hammerjs';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ToastrModule} from 'ngx-toastr';
import {TranslateModule} from '@ngx-translate/core';
import {ContextMenuModule} from '@ctrl/ngx-rightclick';
import { CountdownModule } from 'ngx-countdown';

import {CoreModule} from '@core/core.module';
import {CoreCommonModule} from '@core/common.module';
import {CoreSidebarModule, CoreThemeCustomizerModule} from '@core/components';

import {coreConfig} from 'app/app-config';
import { ErrorInterceptor } from './shared/helpers/error.interceptor';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LayoutModule} from 'app/layout/layout.module';
import {ContentHeaderModule} from 'app/layout/components/content-header/content-header.module';

export let InjectorInstance: Injector;

@NgModule({
  declarations: [
    AppComponent    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    ToastrModule.forRoot(),
    TranslateModule.forRoot(),
    ContextMenuModule,
    CountdownModule,
    CoreModule.forRoot(coreConfig),
    CoreCommonModule,
    CoreSidebarModule,
    CoreThemeCustomizerModule,
    LayoutModule,
    ContentHeaderModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    InjectorInstance = this.injector;
  }
}
