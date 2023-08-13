import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';

import {LoginService} from '../../auth/login/login.service';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(
    private _router: Router, private loginService: LoginService
  ) {
  }

  canActivate() {
    if (this.loginService.isAuth()) {
      return true;
    }

    this._router.navigate(['/auth/login']);
    return false;
  }
}
