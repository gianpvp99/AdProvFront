import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule, Routes} from "@angular/router";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {CoreCommonModule} from "../../@core/common.module";
import {BlockUIModule} from "ng-block-ui";
import {LoginComponent} from "./login/login.component";

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  }
]

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    CoreCommonModule,
    BlockUIModule.forRoot()
  ]
})
export class AuthModule { }
