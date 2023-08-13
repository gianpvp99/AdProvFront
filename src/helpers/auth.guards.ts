import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import {LoginService} from "../app/auth/login/login.service";

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private _router: Router, private _authenticationService: LoginService) {}

  canActivate() {
    if (this._authenticationService.isAuth()) {
      return true;
      
    }else {
      this._router.navigateByUrl('/auth/login');
      return false;
    }    
  }
}